import mongoose, { Document, Schema, Model } from "mongoose";

export interface IOffer extends Document {
  applicant: mongoose.Types.ObjectId;
  offerAccepted?: string;
  createdAt?: Date;
}

const OfferSchema: Schema<IOffer> = new Schema({
  applicant: { type: Schema.Types.ObjectId, ref: "Applicant", required: true },
  offerAccepted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Offer: Model<IOffer> =
  mongoose.models.Offer || mongoose.model<IOffer>("Offer", OfferSchema);
