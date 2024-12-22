

function incHelper (hbs) {
    
    hbs.registerHelper('inc', function(value) {
        return value + 1;
    });
}

function mulHelper (hbs) {
    
    hbs.registerHelper('multiply', function(value1, value2) {
        return value1 * value2;
    });
}

function subHelper (hbs) {
    
    hbs.registerHelper('subtract', function(value1, value2) {
        return value1 - value2;
    });
}

function addHelper (hbs) {

    hbs.registerHelper('add', function(value1, value2) {
        return value1 + value2;
    });
}


function formatDate(hbs) {
  
    hbs.registerHelper('formatDate', function(isoDate) {
        const date = new Date(isoDate);
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      });
}

function stringHelpers(hbs) {
    
    hbs.registerHelper('strlen', function(value) {
        return value.length;
    });

    hbs.registerHelper('substr', function(value, start, length) {
        return value.substring(start, start + length);
    });

    hbs.registerHelper('gt', function(value1, value2) {
        return value1 > value2;
    });
}

function updateCouponHelper(hbs) {
    hbs.registerHelper('json', function(data) {
        // Escape quotes inside JSON to prevent syntax errors
        return new hbs.SafeString(
            JSON.stringify(data).replace(/"/g, '&quot;')
        );
    });
}




module.exports = {

    updateCouponHelper,
    incHelper,
    mulHelper,
    subHelper,
    addHelper,
    formatDate,
    stringHelpers
}