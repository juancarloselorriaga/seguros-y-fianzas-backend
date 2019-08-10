const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const policyClassSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    company: { type: Schema.Types.ObjectId, ref: 'Company'},
    key: {
      type: String,
      required: true
    }
  },
{
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
})

const PolicyClass = mongoose.model('PolicyClass', policyClassSchema);

module.exports = PolicyClass;