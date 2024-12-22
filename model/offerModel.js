const mongoose = require('mongoose');
const categorydetails = require('./categoryModel');

const offerSchema = mongoose.Schema({
    offer_title: { type: String, require: true },
    offer_banner: { type: String, require: true },
    offer_details: { type: String, require: true },
    discount_type: { type: Boolean, require: true },
    discount_value: { type: Number, default: 0 },
    offer_start_date: { type: Date, require: true },
    offer_end_date: { type: Date, require: true },
    offer_category: { type: mongoose.Schema.Types.ObjectId, require: true, ref: categorydetails },
    offer_price: { type: Number, default: 0 },
    isValid: { type: Boolean, default: true },
});

// Post-find middleware to update isValid
offerSchema.post('find', async function (docs) {
    console.log("================docs==================");
    
    console.log(docs);
    const currentDate = new Date();
    for (const doc of docs) {
        if (doc.offer_end_date < currentDate) {
            doc.isValid = false;
            await doc.save(); // Save changes to the database
        }
    }
});

offerSchema.post('findOne', async function (doc) {
    console.log(doc);

    const currentDate = new Date();
    if (doc && doc.offer_end_date < currentDate) {
        doc.isValid = false;
        await doc.save(); // Save changes to the database
    }
});

module.exports = mongoose.model('offers', offerSchema);
