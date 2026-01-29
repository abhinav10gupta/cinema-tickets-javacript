'use-strict';

const TicketService = require('../src/pairtest/TicketService').default;
const TicketTypeRequest = require('../src/pairtest/lib/TicketTypeRequest').default;
const InvalidPurchaseException = require('../src/pairtest/lib/InvalidPurchaseException').default;

// Third Party Services 
const TicketPaymentService = require('../src/thirdparty/paymentgateway/TicketPaymentService').default;
const SeatReservationService = require('../src/thirdparty/seatbooking/SeatReservationService').default;

describe('TicketService - basic happy journey path', () => {
    let service;
    let paymentSpy;
    let seatSpy;

    beforeEach(() => {
        // Mocking the prototypes
        paymentSpy = jest
            .spyOn(TicketPaymentService.prototype, 'makePayment')
            .mockImplementation(() => Promise.resolve());

        seatSpy = jest
            .spyOn(SeatReservationService.prototype, 'reserveSeat')
            .mockImplementation(() => Promise.resolve());
        
        service = new TicketService(); 
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('1st Case : 1 Adult pay £25 and reserves 1 seat', async () => {
        // Act
        await service.purchaseTickets(1, new TicketTypeRequest('ADULT', 1));

        //Assert 
        expect(paymentSpy).toHaveBeenCalledTimes(1);
        expect(paymentSpy).toHaveBeenCalledWith(1, 25);
        expect(seatSpy).toHaveBeenCalledTimes(1);
        expect(seatSpy).toHaveBeenCalledWith(1,1);
    });

    test('2 adults, 1 Child, 1 Infant -> pay £65 and reserves 3 seat', async () => {
        await service.purchaseTickets(
            123,
            new TicketTypeRequest('ADULT', 2),
            new TicketTypeRequest('CHILD', 1),
            new TicketTypeRequest('INFANT', 1)
        );

        expect(paymentSpy).toHaveBeenCalledWith(123, 65);
        expect(seatSpy).toHaveBeenCalledWith(123, 3);
    });

    test('Child without Adult -> throws InvalidPurchaseException', async () => {
        const request = service.purchaseTickets(123, new TicketTypeRequest('CHILD', 1));
        
        await expect(request).rejects.toThrow(InvalidPurchaseException);
        expect(paymentSpy).not.toHaveBeenCalled();
        expect(seatSpy).not.toHaveBeenCalled();
    });

    test('Infant without Adult -> throws InvalidPurchaseException', async () => {
        const request = service.purchaseTickets(123, new TicketTypeRequest('INFANT', 2));

        await expect(request).rejects.toThrow(InvalidPurchaseException);
        expect(paymentSpy).not.toHaveBeenCalled();
        expect(seatSpy).not.toHaveBeenCalled();
    });

    test('Over Maximum Tickets Total -> throws InvalidPurchaseException', async () => {
        // MAX_TICKETS that can be purchased is 25, trying with greater than 25.
        const request = service.purchaseTickets(
            123,
            new TicketTypeRequest('ADULT', 1),
            new TicketTypeRequest('CHILD', 25) 
        );

        await expect(request).rejects.toThrow(InvalidPurchaseException);
        expect(paymentSpy).not.toHaveBeenCalled();
    });

    test('Successful Edge Case: 25 Valid Tickets', async () => {
        // Testing a boundary scenario with 25 total tickets (10 Adult, 15 Child)
        await service.purchaseTickets(
            123,
            new TicketTypeRequest('ADULT', 10),
            new TicketTypeRequest('CHILD', 15)
        );

        expect(paymentSpy).toHaveBeenCalledWith(123, 475);
        expect(seatSpy).toHaveBeenCalledWith(123, 25);
    });

    test('Unknown ticket type or negative quantity -> throws exception', async () => {
        // Unknown Type (simulated via manual object if TicketTypeRequest doesn't catch it)
        const badType = { getTicketType: () => 'STUDENT', getNoOfTickets: () => 1 };
        await expect(service.purchaseTickets(123, badType)).rejects.toThrow();

        // Negative QTY
        const negativeQty = new TicketTypeRequest('ADULT', -1);
        await expect(service.purchaseTickets(123, negativeQty)).rejects.toThrow();

    });
});