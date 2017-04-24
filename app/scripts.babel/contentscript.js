'use strict';

console.log('content script');

window.addEventListener('load', runContentScript, false);

var currencies = [];
var defaultCurrencies = [{
  name: 'Coffee',
  price: 2
}, {
  name: 'Bentley',
  price: 180000
}];

chrome
  .storage
  .sync
  .get({
    currencies: [] //put defaultvalues if any
  }, function(data) {
    if (data.currencies.length) {
      currencies = data.currencies;
    } else {
      currencies = defaultCurrencies;
    }
  });


function runContentScript() {
  // Select all price tags
  var prices = [];

  var selectors = ['span:not([class*=size])', 'td', 'b', 'div', 'a', 'i'
  // 'span[class$="value"]',
  // 'span[class$="total"]',
  ];

  // Get total
  function getTotal(el) {
    var total = el.html().replace('<span class="wi-dot" style="display: inline;"></span>', '').replace('$', '').replace(/\s*/g, '');

    return total;
  }

  for (var i = 0; i < selectors.length; i++) {

    var el = $(selectors[i]);

    // RegExp test
    // var num = new RegExp(/(?:\d*\.)?\d+(\s?)+$/);
    // var test1 = new RegExp(/^\s*?\$(\d{1,3})?(,?\d{3})*(\.\d{2})?\s*?$/);
    var test1 = new RegExp(/^\s*?\$(\d{1,3})?(,?\d{3})*(\.\d{2})?\s*?/);
    var test2 = new RegExp(/^\s*?(\d{1,3})?(,?\d{3})*(\.\d{2})\s*?$/);

    if (el.length) {
      el.each(function (index, el) {

        // Test html to see if it's a number: 12.34 or $23
        var html = $(this).html();

        if (test1.test(html) || test2.test(html)) {

          // Add selected class for avoiding duplication
          if ($(this).hasClass('wi-selected') == false) {

            // Price is not 0
            if (getTotal($(this)) != 0) {
              $(this).addClass('wi-selected');
              prices.push(this);
            }
          }
        }
      });
    }
  }

  // Tooltip
  function addTooltip(el, total) {

    var pos = el.offset();

    var top = 0 + 'px';
    var left = 0 + 'px';

    var list = '';

    for (var i = 0; i < currencies.length; i++) {
      var qty = total / currencies[i].price;
      var item = currencies[i].name;

      if (qty > 1) {
        qty = Math.round(qty);
      } else {
        qty = qty.toFixed(1-Math.floor(Math.log(qty)/Math.log(10)));
      }

      if (qty > 1) {
        item = pluralize(item);
      }

      list += '<li class="wi-list-item"><span class="qty">' + qty + '</span> <span class="wi-currency">' + item + '</span></li>';
    }

    var tooltip = '<span class="wi-tooltip" id="wi-tooltip" style="top: ' + top + '; left: ' + left + '"><ul class="wi-list">' + list + '</ul></span>';

    $('body').prepend(tooltip);

    // Tooltip move with cursor

    var tooltip = document.getElementById('wi-tooltip');

    window.onmousemove = function (e) {
      var x = e.clientX,
          y = e.clientY;
      tooltip.style.top = y + 'px';
      tooltip.style.left = x + 'px';
    };
  }

  // Extension start working when price array is not empty
  if (prices.length) {
    chrome.runtime.sendMessage({
      status: 'on'
    }, function (response) {
      // console.log(response.status);
    });

    // Create tooltips
    $(prices).each(function (index, el) {

      // $(this).append('<span class="wi-dot" style="display: inline;"></span>'); // Add dots for knowing which prices are available for the extension
      $(this).addClass('wi-dot'); // Add dots for knowing which prices are available for the extension

      $(this).promise().done(function () {
        $('.wi-dot').addClass('wi-dot-active');
      });

      $(this).hover(function () {
        var price = 0;
        var total = getTotal($(this));

        // price = Math.round(html / currenciesPrice);

        // Prenvent quick hover blink
        $('.wi-tooltip').remove();

        addTooltip($(this), total);

        $('#wi-tooltip').fadeIn('fast', function () {});
      }, function () {
        /* Stuff to do when the mouse leaves the element */
        $('#wi-tooltip').fadeOut('fast', function () {
          $(this).remove();
        });
      });
    });

  } else {
    chrome.runtime.sendMessage({
      status: 'off'
    }, function (response) {
      // console.log(response.status);
    });
  }

  // Dom change
  function nodeInsertedCallback(event) {
    // console.log(event);
  }
  document.addEventListener('DOMNodeInserted', nodeInsertedCallback);
}
