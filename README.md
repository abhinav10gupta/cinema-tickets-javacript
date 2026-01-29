### 430573: Senior Software Engineer 
### Application ID number: 15902521

# Cinema Tickets Project

A JavaScript implementation for a cinema ticket booking system that handles business logic for ticket types, pricing, and seat reservations.

## Getting Started

Follow these steps to set up the project on your local machine:

### Step 1: Clone the Repository
Open your terminal and run the following command to clone the project:

`git clone https://github.com/abhinav10gupta/cinema-tickets-javacript.git`


### Step 2: Install Dependencies
cd cinema-tickets-javacript
npm i


### Step 3: Run all Test Cases
npm run test


### Business Rules Implemented 
There are 3 types of tickets i.e. Infant, Child, and Adult.
The ticket prices are based on the type of ticket (see table below).
The ticket purchaser declares how many and what type of tickets they want to buy.
Multiple tickets can be purchased at any given time.
Only a maximum of 25 tickets that can be purchased at a time.
Infants do not pay for a ticket and are not allocated a seat. They will be sitting on an Adult's lap.
Child and Infant tickets cannot be purchased without purchasing an Adult ticket. | Ticket Type | Price | | ---------------- | ----------- | | INFANT | £0 | | CHILD | £15 | | ADULT | £25 |
There is an existing TicketPaymentService responsible for taking payments.
There is an existing SeatReservationService responsible for reserving seats.
Constraints
The TicketService interface CANNOT be modified.
The code in the thirdparty.* packages CANNOT be modified.
The TicketTypeRequest SHOULD be an immutable object.


### Assumptions

All accounts with an id greater than zero are valid. They also have sufficient funds to pay for any no of tickets.
The TicketPaymentService implementation is an external provider with no defects. You do not need to worry about how the actual payment happens.
The payment will always go through once a payment request has been made to the TicketPaymentService.
The SeatReservationService implementation is an external provider with no defects. You do not need to worry about how the seat reservation algorithm works.
The seat will always be reserved once a reservation request has been made to the SeatReservationService.
