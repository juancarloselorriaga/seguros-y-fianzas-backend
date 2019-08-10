const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const factorSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    factor: {
      type: Number,
      required: true
    }
  },
{
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
})

const Factor = mongoose.model('Factor', factorSchema);

module.exports = Factor;