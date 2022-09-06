 module.exports = {
      routes: [
        {
         method:"POST",
         path: "/paymentprocess/",
         handler:"registro.paymentProcess",
        },
        {
         method:"GET",
         path: "/paymentfeedback/",
         handler:"registro.paymentFeedback",
        },
	{
         method:"GET",
         path: "/paymentfailure/",
         handler:"registro.paymentFailure",
        },
	{
         method:"GET",
         path: "/paymentsuccess/:id",
         handler:"registro.paymentSuccess",
        }

      ]
    }

