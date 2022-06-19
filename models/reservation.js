/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** getter/setter for numGuests */

  set numGuests(n) {
    if(n < 1){throw new Error('Number of guests must be at least 1')};
    this._numGuests = n;
  }

  get numGuests() {
    return this._numGuests;
  }

   /** getter/setter for notes */

   set notes(val) {
    this._notes = val || ""
  }

  get notes() {
    return this._notes
  }

  /** getter/setter for startAt */

  set startAt(val) {
    if (val instanceof Date) this._startAt = val;
    else throw new Error("Not a valid date");
  }

  get startAt() {
    return this._startAt
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** getter/setter for customerId */

  set customerId(val) {
    if(this._customerId && this._customerId !== val) throw new Error("This reservation has already been assigned.");
    this._customerId = val;
  }

  get customerId() {
    return this._customerId
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.numGuests, this.startAt, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET customer_id=$1, num_guests=$2, start_at=$3, notes=$4
             WHERE id=$5`,
        [this.customerId, this.numGuests, this.startAt, this.notes, this.id]
      );
    }
  }
}


module.exports = Reservation;
