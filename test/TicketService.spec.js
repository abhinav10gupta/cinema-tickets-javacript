'use-strict';

const TicketService = require('../src/pairtest/TicketService').default;
const TicketTypeRequest = require('../src/pairtest/lib/TicketTypeRequest').default;
const InvalidPurchaseException = require('../src/pairtest/lib/InvalidPurchaseException').default;

//Third Party Services 
const TicketPaymentService = require('../src/thirdparty/paymentgateway/TicketPaymentService').default;
const SeatReservationService = require('../src/thirdparty/seatbooking/SeatReservationService').default;

describe('TicketService - basic happy journey path', () => {
    let service;
    let paymentSpy;
    let seatSpy;

    beforeEach(() => {
        paymentSpy = jest
            .spyOn(TicketPaymentService.prototype, 'makePayment')
            .mockImplementation(() => {});
        seatSpy = jest
            .spyOn(SeatReservationService.prototype, 'reserveSeat')
            .mockImplementation(() => {});
        service = new TicketService(); // Keep the interface unchanged.
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('1st Case : 1 Adult pay £25 and reserves 1 seat', () => {
        // Act
        service.purchaseTickets(1, new TicketTypeRequest('ADULT', 1));

        //Assert 
        expect(paymentSpy).toHaveBeenCalledTimes(1);
        expect(paymentSpy).toHaveBeenCalledWith(1, 25);
        expect(seatSpy).toHaveBeenCalledTimes(1);
        expect(seatSpy).toHaveBeenCalledWith(1,1);
    });

    test('2 adults, 1 Child, 1 Infant -> pay £65 and reserves 3 seat', () => {
        service.purchaseTickets(
            123,
            new TicketTypeRequest('ADULT', 2),
            new TicketTypeRequest('CHILD', 1),
            new TicketTypeRequest('INFANT', 1)
        );

        expect(paymentSpy).toHaveBeenCalledWith(123, 65);
        expect(seatSpy).toHaveBeenCalledWith(123, 3);
    });

    test('Child without Adult -> throws InvalidPurchaseException', () => {
        expect(() => {
            service.purchaseTickets(
                123,
                new TicketTypeRequest('CHILD', 1))
                    .toThrow(InvalidPurchaseException);

            expect(paymentSpy).not.toHaveBeenCalled();
            expect(seatSpy).not.toHaveBeenCalled();
        });
    });

    test('Infant without Adult -> throws InvalidPurchaseException', () => {
        expect(() => {
            service.purchaseTickets(
                123,
                new TicketTypeRequest('INFANT', 2))
                    .toThrow(InvalidPurchaseException);
    
            expect(paymentSpy).not.toHaveBeenCalled();
            expect(seatSpy).not.toHaveBeenCalled();
        });   
    });

    test('Over 25 Tickets Total -> throws InvalidPurchaseException', () =>{
        expect(() => {
            service.purchaseTickets(
                123,
                new TicketTypeRequest('ADULT', 1),
                new TicketTypeRequest('CHILD', 25))
                    .toThrow(InvalidPurchaseException);
    
            expect(paymentSpy).not.toHaveBeenCalled();
            expect(seatSpy).not.toHaveBeenCalled();
        }); 
    });

    test('25 Valid Tickets', () => {
        service.purchaseTickets(
            123,
            new TicketTypeRequest('ADULT', 10),
            new TicketTypeRequest('CHILD', 15)
        );

        expect(paymentSpy).toHaveBeenCalledWith(123, 475);
        expect(seatSpy).toHaveBeenCalledWith(123, 25);
    });

    test('Unknown ticket type or negative qualtity -> throws exception', () =>{
        // Unknown Type 
        expect(() =>
            service.purchaseTickets(123, new TicketTypeRequest('STUDENT', 1)))
        .toThrow();

        // Negative QTY 
        expect(() =>
            service.purchaseTickets(123, new TicketTypeRequest('ADULT', -1)))
        .toThrow();

    });
})