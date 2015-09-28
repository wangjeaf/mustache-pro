Mustache.registerFilter({
    number: function(fixed) {
        fixed = fixed || 2;
        return function(value) {
          if (value == null) {
            return '-';
          }
          var value = parseFloat(value);
          if (isNaN(value)) {
            return '-';
          }
          return value.toFixed(fixed);
        }
    },
    percent: function(value) {
        return value * 100 + '%'
    },
    floatPercent: function(fixed) {
        fixed = fixed || 2;
        return function(value) {
          if (value == null) {
            return '-';
          }
          var value = parseFloat(value);
          if (isNaN(value)) {
            return '-';
          }
          return (value * 100).toFixed(fixed) + '%';
        }
    },
    rmb: function(value) {
        return "￥" + value;
    },
    doller: function(value) {
        return "$" + value;
    },
    thousand: function(value) {
        value += '';
        var thousandPeriod = /(\d{1,3})(?=(?:\d{3})+\.)/g;
        var thousand = /(\d{1,3})(?=(?:\d{3})+$)/g;
        var reg = value.indexOf('.') != -1 ? thousandPeriod : thousand;

        value = value.replace(reg, '$1,');
        return value;
    }
});