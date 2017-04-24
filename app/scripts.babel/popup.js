'use strict';

var $newName = $('#new-currency'),
  $newPrice = $('#new-price');

var $currencyList = $('#currency-list');
var $status = $('#status');
var $addBtn = $('#add-btn');

var storedCurrencies = [];

function createCurrency(name, price, index) {
  var nameInput = '<input name="edit-currency" class="edit-currency" type="text" placeholder="e.g. Latte">';
  var priceInput = '<input name="edit-price" class="edit-price" type="number" step="0.01" placeholder="" value="0">';

  var tpl1 = '<tr class=""><td class="name"><span>',
    tpl2 = '</td><td class="unit-price"><span>',
    tpl3 = '</td><td class="actions"><button data-index="',
    tpl4 = '" class="edit-btn pure-button pure-button-primary wi-button wi-button-circle wi-button-green" type="button" name="button"><i class="fa fa-pencil"></i></button><button data-index="',
    tpl5 = '" class="save-btn pure-button pure-button-primary wi-button wi-button-circle wi-button-gold" type="button" name="button"><i class="fa fa-check"></i></button><button data-index="',
    tpl6 = '" class="remove-btn pure-button pure-button-primary wi-button wi-button-circle wi-button-red" type="button" name="button"><i class="fa fa-remove"></i></button></td>';

  var newCurrency = tpl1 + name + '</span>' + nameInput + tpl2 + price + '</span>' + priceInput + tpl3 + index + tpl4 + index + tpl5 + index + tpl6;

  return newCurrency;
}

// actions

// remove
function removeCurrency() {
  var index = $(this).data('index');
  // Remove from the list;
  $(this)
    .parents('tr')
    .fadeOut('fast', function() {});

  // Remove from storage
  storedCurrencies.splice(index, 1);

  chrome
    .storage
    .sync
    .set({
      currencies: storedCurrencies
    }, function() {
      // Update status to let user know options were saved.
      $status.textContent = 'Saved!';
      setTimeout(function() {
        $status.textContent = '';
      }, 750);
    });

  console.log('removed: ' + index);
}

// edit
function editCurrency() {
  var index = $(this).data('index');
  var name = $(this)
    .parents('tr')
    .find('.name span')
    .html();
  var price = parseInt($(this).parents('tr').find('.unit-price span').html(), 10);

  // Change view
  $('tr.editing').each(function(index, el) {
    $(el).removeClass('editing');
  });
  $(this)
    .parents('tr')
    .addClass('editing');
  // $(this).parents('tr').find('.name');
  // $(this).parents('tr').find('.unit-price');

  $(this)
    .parents('tr')
    .find('input.edit-currency')
    .val(name);
  $(this)
    .parents('tr')
    .find('input.edit-price')
    .val(price);
}

// save
function saveCurrency() {
  var index = $(this).data('index');

  var newName = $(this)
      .parents('tr')
      .find('input.edit-currency')
      .val(),
    newPrice = parseInt($(this)
      .parents('tr')
      .find('input.edit-price')
      .val(), 10);

  // Return if values are not valid
  if (newName && newPrice) {
    var newItem = {
      name: newName,
      price: newPrice
    };

    // Change UI VIEW
    $(this).parents('tr').find('.name span').html(newName);
    $(this).parents('tr').find('.unit-price span').html(newPrice);

    // Store values
    storedCurrencies[index] = newItem;

    chrome
      .storage
      .sync
      .set({
        currencies: storedCurrencies
      }, function() {
        // Update status to let user know options were saved.
        $status.textContent = 'Saved!';
        setTimeout(function() {
          $status.textContent = '';
        }, 750);
      });

  } else {
    return;
    console.log('Empty value found after editing.');
  }

  // Change view
  $('tr.editing')
    .each(function(index, el) {
      $(el).removeClass('editing');
    });

  $(this)
    .parents('tr')
    .find('input.edit-currency')
    .val(name);
  $(this)
    .parents('tr')
    .find('input.edit-price')
    .val(price);
}

function actionBtns() {
  var editBtns = $('.edit-btn');
  var removeBtns = $('.remove-btn');
  var saveBtns = $('.save-btn');

  editBtns.each(function(index, el) {
    $(el).bind('click', editCurrency);
  });

  removeBtns.each(function(index, el) {
    $(el).bind('click', removeCurrency);
  });

  saveBtns.each(function(index, el) {
    $(el).bind('click', saveCurrency);
  });
}

function buttonState(state) {
  if (state === 'enable') {
    $addBtn
      .removeClass('pure-button-disabled')
      .addClass('wi-button-green');
  } else if (state === 'disable') {
    $addBtn
      .addClass('pure-button-disabled')
      .removeClass('wi-button-green');
  } else {
    return;
  }
}

// Change add btn status
$('.new-currency-form input')
  .each(function() {
    var elem = $(this);

    // Save current value of element
    elem.data('oldVal', elem.val());

    // Look for changes in the value
    elem.bind('propertychange change click keyup input paste', function(event) {
      // Quit editing mode
      $('tr.editing')
        .each(function(index, el) {
          $(el).removeClass('editing');
        });

      // If value has changed...

      if ($newName.val() && $newPrice.val()) {
        buttonState('enable');
      } else {
        buttonState('disable');
      }

    });
  });

function update(item) {
  storedCurrencies.push(item);
  //then call the set to update with modified value
  chrome
    .storage
    .sync
    .set({
      currencies: storedCurrencies
    }, function() {
      // Update status to let user know options were saved.
      $status.textContent = 'Saved!';
      setTimeout(function() {
        $status.textContent = '';
      }, 750);
    });
}

chrome
  .storage
  .sync
  .get({
    currencies: [] //put defaultvalues if any
  }, function(data) {
    storedCurrencies = data.currencies;

    // Display currency list
    for (var i = 0; i < storedCurrencies.length; i++) {

      var name = storedCurrencies[i].name;
      var price = storedCurrencies[i].price;

      var currency = createCurrency(name, price, i);

      $currencyList.prepend(currency);
    }

    // Bind actions to action btns
    actionBtns();

  });

// Saves options to chrome.storage
function saveOptions(name, price) {
  var item = {
    name: name,
    price: price
  };

  if (!name || !price) {
    message('Error: No value specified');
    return;
  }

  update(item);
}

// Actions
$addBtn
  .click(function(event) {
    var name = $newName.val();
    var price = $newPrice.val();
    var index = storedCurrencies.length;

    // Save to storage
    saveOptions(name, price);

    // Prepend to list
    var newCurrency = createCurrency(name, price, index);
    $currencyList.prepend(newCurrency);

    // Update button actions
    // Bind actions to action btns
    actionBtns();

    // reset

    $newName.val('');
    $newPrice.val('');

    buttonState('disable');
  });
