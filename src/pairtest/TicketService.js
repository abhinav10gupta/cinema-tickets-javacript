const InvalidPurchaseException = require('./lib/InvalidPurchaseException.js').default;
const TicketPaymentService = require('../thirdparty/paymentgateway/TicketPaymentService.js').default;
const SeatReservationService = require('../thirdparty/seatbooking/SeatReservationService.js').default;
const {CONSTANTS, PRICES} = require('./config/cinemaRules.js');
export default class TicketService {
    /**
   * Should only have private methods other than the one below.
   */

  // To keep interface intact - No DI in constructor 

  constructor(){
    this.paymentService = new TicketPaymentService();
    this.seatService = new SeatReservationService();
  }

  async purchaseTickets(accountId, ...ticketTypeRequests) {
    this.#validateAccountId(accountId);

    const requests = this.#normalizeRequests(ticketTypeRequests);
    const totals = this.#calculateTotals(requests);

    this.#validateBusinessRules(totals);

    const totalAmount = this.#calculateAmount(totals);
    const totalSeats = this.#calculateSeats(totals);
    try{
      await Promise.all([
        this.#processPayment(accountId, totalAmount),
        this.#processReservation(accountId, totalSeats)
      ]);
    }
    catch(error){
      this.#handleExternalServiceFailure(error, accountId);

    }
  }

  async #processPayment(accountId, amount){
    return this.paymentService.makePayment(accountId, amount);
  }

  async #processReservation(accountId, seats){
    return this.seatService.reserveSeat(accountId, seats);
  }

  #handleExternalServiceFailure(error, accountId){
    console.error(`Transaction Failed for AccountId: ${accountId} :: ErrorMessage -`, error.message);
    throw new InvalidPurchaseException(
      'Payment or Reservation failed. Please try again later or contact support.'
    );
  }

  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('Invalid accountId. Must be a positive integer.');
    }
  }

  #normalizeRequests(ticketTypeRequests) {
    if (ticketTypeRequests.length === 1 && Array.isArray(ticketTypeRequests[0])) {
      return ticketTypeRequests[0];
    }
    return ticketTypeRequests;
  }

  #calculateTotals(requests) {
    const totals = { INFANT: 0, CHILD: 0, ADULT: 0 };

    for (const req of requests) {
      this.#validateRequest(req);

      const type = String(req.getTicketType()).toUpperCase();
      const qty = req.getNoOfTickets();

      this.#validateTicketType(type);
      this.#validateQuantity(qty);

      totals[type] += qty;
    }

    return totals;
  }

  #validateRequest(req) {
    if (
      !req ||
      typeof req.getTicketType !== 'function' ||
      typeof req.getNoOfTickets !== 'function'
    ) {
      throw new InvalidPurchaseException('Invalid ticket request.');
    }
  }

  #validateTicketType(type) {
    if (!['INFANT', 'CHILD', 'ADULT'].includes(type)) {
      throw new InvalidPurchaseException(`Unknown ticket type: ${type}.`);
    }
  }

  #validateQuantity(qty) {
    if (!Number.isInteger(qty) || qty < 0) {
      throw new InvalidPurchaseException(
        'Invalid number of tickets. Must be a positive integer.'
      );
    }
  }

  #validateBusinessRules(totals) {

    const totalTickets = totals.ADULT + totals.CHILD + totals.INFANT;

    if (totalTickets === 0) {
      throw new InvalidPurchaseException('Total tickets must be at least 1');
    }

    if ((totals.CHILD > 0 || totals.INFANT > 0) && totals.ADULT === 0) {
      throw new InvalidPurchaseException(
        'Child/Infant ticket requires at least one Adult.'
      );
    }

    if (totalTickets > CONSTANTS.MAX_TICKETS) {
      throw new InvalidPurchaseException(
        `Cannot purchase more than ${CONSTANTS.MAX_TICKETS} tickets.`
      );
    }
  }

  #calculateAmount(totals) {
    return totals.ADULT * PRICES.ADULT + totals.CHILD * PRICES.CHILD;
  }

  #calculateSeats(totals) {
    return totals.ADULT + totals.CHILD;
  }
}

