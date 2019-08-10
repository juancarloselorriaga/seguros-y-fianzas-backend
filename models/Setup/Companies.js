const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const companySchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    contactInfo: [
      { type: Schema.Types.ObjectId, ref: 'ContactInfo' }
    ],
  },
{
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
})

const Company = mongoose.model('Company', companySchema);

module.exports = Company;