const stripe = require("../utils/stripe");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const AppError = require("../utils/AppError");

const createStripePayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new AppError(`Order not found`, 404));
    }
    if (order.user.toString() !== req.user) {
      return next(new AppError(`You are not allowed`, 403));
    }
    if (order.paymentStatus === "paid") {
      return next(new AppError(`ORder is already paid`, 400));
    }

    // create stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalAmount * 100,
      currency: "usd",
      metadata: {
        orderId: order._id.toString(),
        userId: req.user,
      },
    });

    const payment = await Payment.create({
      order: order._id,
      user: req.user,
      amount: order.totalAmount,
      method: "stripe",
      status: "pending",
      transactionId: paymentIntent.id,
    });

    res.status(201).json({
      success: true,
      message: "Stripe Payment initialized",
      paymentId: payment._id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const stripeWebhook = async (req, res) => {
  const signature =
    req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: `Webhook Error: ${error.message}`,
    });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        const orderId =
          paymentIntent.metadata.orderId;

        const payment =
          await Payment.findOne({
            transactionId: paymentIntent.id,
          });

        if (!payment) {
          console.log(
            "Payment record not found"
          );
          break;
        }

        payment.status = "paid";
        payment.paidAt = new Date();

        await payment.save();

        await Order.findByIdAndUpdate(
          orderId,
          {
            paymentStatus: "paid",
          }
        );

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent =
          event.data.object;

        const payment =
          await Payment.findOne({
            transactionId: paymentIntent.id,
          });

        if (payment) {
          payment.status = "failed";
          await payment.save();
        }

        break;
      }

      default:
        console.log(
          `Unhandled event: ${event.type}`
        );
    }

    res.json({
      received: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

module.exports = {
  createStripePayment,
  stripeWebhook,
};
