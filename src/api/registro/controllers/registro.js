'use strict';

/**
 *  registro controller
 */
const getService = (name) => {
  return strapi.plugin("users-permissions").service(name);
};
const mercadopago = require("mercadopago");

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::registro.registro', ({strapi})=>({

    getTheContract: async (ctx)=>{
	const serverurl = strapi.config.get('server.urltomedia');
	console.log(serverurl);
	const userPermissionService = getService('users-permissions');
        const {params, request} = ctx;
        const  {id:idRegistro} = ctx.params;
        const resultFind = await strapi.entityService.findOne(
                'api::registro.registro', 
                Number(idRegistro),
                {
                populate:
                        {
                        nombres:true,
                        apellido_paterno:true,
                        apellido_materno:true,
                        fecha_de_nacimiento:true,
                        curp:true,
                        rfc:true,
                        correo:true,
                        telefonos:true,
                        ine_1:true,
                        ine_2:true,
                        foto:true,
			tipo_inversion:true,
			valor_inversion:true,
			plazo_inversion:true
                        }
                }
    
        );

	const resultContractTemplate = await strapi.entityService.findMany("api::contrato.contrato");
	const finalContract = await userPermissionService.template(resultContractTemplate.plantilla, {
      		NOMBRES: resultFind.nombres,
      		APELLIDOPATERNO: resultFind.apellidopaterno,
     		APELLIDOMATERNO: resultFind.apellido_materno,
      		FECHANACIMIENTO: resultFind.fecha_nacimiento,
      		CURP: resultFind.curp,
		RFC: resultFind.rfc,
		CORREO: resultFind.correo,
		TELEFONOS: resultFind.telefonos,
		INE1: serverurl+resultFind.ine_1.formats.large.url,
		INE2: serverurl+resultFind.ine_2.formats.large.url,
		FOTO: serverurl+resultFind.foto.formats.large.url,
		TIPOINVERSION:resultFind.tipo_inversion,
		VALORINVERSION:resultFind.valor_inversion,
		PLAZOINVERSION:resultFind.plazo_inversion	
    });
        return finalContract;
    },

    paymentProcess: async (ctx, res)=>{

	//const {params, request} = ctx;
	const serverurl = strapi.config.get('server.urltomedia');
	mercadopago.configure({
		access_token: "APP_USR-322877679534842-080315-7d47dc226631a12353b3954ed211771b-1171890125",
  		//access_token:
    		//"TEST-322877679534842-080315-10f085fe9cdbd218f78f6cf2e39c4ea6-1171890125",
	});
	console.log(ctx.request.body.data.price);
	try {
		 //var res = {}
   		 let preference = {
      			items: [
        			{
          			title: "Payment process",
          			unit_price: ctx.request.body.data.price,
          			quantity: 1,
        			},
      		],
      			back_urls: {
        			success: serverurl+"/api/paymentsuccess/"+ctx.request.body.data.idregistro+"/",
        			failure: serverurl+"/api/paymentfeedback/"+ctx.request.body.data.idregistro+"/",
        			pending: serverurl+"/api/paymentpending/"+ctx.request.body.data.idregistro+"/",
      			},
			statement_descriptor: "Todos Ganan",
      			marketplace: "Todos Ganan",
			payer: {
      				email: ctx.request.body.data.email,
      				identification: {
        				type: "CURP",
        				number: ctx.request.body.data.curp,
      			},
			external_reference: ctx.request.body.data.curp,
    },
 	   	};

		//console.log(preference.back_urls.success)

   		 const respuesta = mercadopago.preferences
      		.create(preference)
		.then((response) => {
        		//console.log("PROCESS PAYMENT", response.body.id , response.body.sandbox_init_point)
			//return {"id": response.body.id, "sandbox": response.body.sandbox_init_point}
        		/*res.json({
          		id: response.body.id,
          		sandbox: response.body.sandbox_init_point,
        		});*/
			try{
				res = {
				id: response.body.id,
                        	sandbox: response.body.sandbox_init_point,
				init_point: response.body.init_point
				}
                        	console.log(res)
				return res 
			}catch(e){
				console.log(e)
			}
      		});
		return respuesta
		//console.log("Funciona")
  	} catch (error) {
		console.log(error);
    		return(error);
  	}
	


            //return {message: "Funciona"}
    },


    paymentFeedback: async ()=>{
	//console.log(ctx.params.id)
        //console.log(ctx.request.query.preference_id)
        try{
                await strapi.service('api::registro.registro').update(ctx.params.id, {'data':{'numero_transaccion':ctx.request.query.preference_id, 'estado_transaccion': 'Pendiente'}})
        }catch(e)
        {console.log(e)}
	 return {"status": 200, "message": "Payment pending"}
    },

    paymentFailure: async ()=>{
//console.log(ctx.params.id)
        //console.log(ctx.request.query.preference_id)
        try{
                await strapi.service('api::registro.registro').update(ctx.params.id, {'data':{'numero_transaccion':ctx.request.query.preference_id, 'estado_transaccion': 'Rechazado'}})
        }catch(e)
        {console.log(e)}
	return {"status": 200, "message": "Payment fail" }
    },		

    paymentSuccess: async (ctx)=>{
	//console.log(ctx.params.id)
	//console.log(ctx.request.query.preference_id)
	try{
		await strapi.service('api::registro.registro').update(ctx.params.id, {'data':{'numero_transaccion':ctx.request.query.preference_id, 'estado_transaccion': 'Aprobado'}})
	}catch(e)
	{console.log(e)}
        return {"status": 200, "message": "Payment registered" }
    }	


}));
