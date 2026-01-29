const deepFreeze = require("deep-freeze");

const PRICES = deepFreeze({
    INFANT: 0,
    CHILD: 15,
    ADULT: 25
});

const CONSTANTS = deepFreeze({
    MAX_TICKETS: 25
});
    
module.exports = {
    PRICES,
    CONSTANTS
}