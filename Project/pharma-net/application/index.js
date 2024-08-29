const express = require('express');
const app = express();
const cors = require('cors');
const port = 8000;

//Import all functions
const addToWallet_manufacturer = require('./addToWallet/manufacturer_addToWallet.js');
const addToWallet_distributor = require('./addToWallet/distributor_addToWallet.js');
const addToWallet_retailer = require('./addToWallet/retailer_addToWallet.js');
const addToWallet_consumer = require('./addToWallet/consumer_addToWallet.js');
const addToWallet_transporter = require('./addToWallet/transporter_addToWallet.js');
const registerCompany = require('./utils/registerCompany.js');
const addDrug = require('./utils/addDrug.js');
const createPO = require('./utils/createPO.js');
const createShipment = require('./utils/createShipment');
const retailDrug = require('./utils/retailDrug.js');
const updateShipment = require('./utils/updateShipment.js');
const viewDrugCurrentState = require('./utils/viewDrugCurrentState.js');
const viewHistory = require('./utils/viewHistory.js');


//Define express app settings

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));
app.set('title', 'Pharma Network');

app.get('/', (req, res) => res.send(" Application for Pharma Network "));

app.post('/addToWallet', (req, res) => {
	addToWallet_manufacturer.execute(req.body.certificatePath, req.body.privateKeyPath)
		.then(() => {
			console.log('User credentials added to wallet');
			const result = {
				status: 'success',
				message: 'User credentials added to wallet'
			};
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/addToWallet', (req, res) => {
	addToWallet_distributor.execute(req.body.certificatePath, req.body.privateKeyPath)
		.then(() => {
			console.log('User credentials added to wallet');
			const result = {
				status: 'success',
				message: 'User credentials added to wallet'
			};
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/addToWallet', (req, res) => {
	addToWallet_retailer.execute(req.body.certificatePath, req.body.privateKeyPath)
		.then(() => {
			console.log('User credentials added to wallet');
			const result = {
				status: 'success',
				message: 'User credentials added to wallet'
			};
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/addToWallet', (req, res) => {
	addToWallet_consumer.execute(req.body.certificatePath, req.body.privateKeyPath)
		.then(() => {
			console.log('User credentials added to wallet');
			const result = {
				status: 'success',
				message: 'User credentials added to wallet'
			};
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/addToWallet', (req, res) => {
	addToWallet_transporter.execute(req.body.certificatePath, req.body.privateKeyPath)
		.then(() => {
			console.log('User credentials added to wallet');
			const result = {
				status: 'success',
				message: 'User credentials added to wallet'
			};
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});


app.post('/registerCompany', (req, res) => {
	registerCompany.execute(req.body.companyCRN, req.body.companyName, req.body.Location, req.body.organisationRole, req.body.organisationRole1).then((company) => {
			console.log('Registering a Company');
			var result;
			//if the return object contains error property then return status = failure
			//if return object doesn't have error property then return status = success
			//returnObject.errorTace property will print more detailed error or trace logs
			if (company.error) {
				result = {
					status: 'Failure',
					message: 'Error while registering the company, condition to register company not fullfilled',
					error: company.error,
					errorTrace: company.errorTrace
				};
			} else {
				result = {
					status: 'success',
					message: 'Company Registered',
					company: company
				};
			}
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		})
})

app.post('/addDrug', (req, res) => {
	addDrug.execute(req.body.drugName, req.body.serialNo, req.body.mfgDate, req.body.expDate, req.body.companyCRN, req.body.organisationRole).then((drug) => {
			console.log('Adding Drug');
			var result;
			if (drug.error) {
				result = {
					status: 'Failure',
					message: 'Error while adding the drug',
					error: drug.error,
					errorTrace: drug.errorTrace
				};
			} else {
				result = {
					status: 'success',
					message: 'Drug Added successfully',
					drug: drug
				};
			}
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		})
})

app.post('/createPO', (req, res) => {
	createPO.execute(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity, req.body.organisationRole).then((purchaseOrder) => {
			console.log('Creating Purchase Order');
			var result;
			if (purchaseOrder.error) {
				result = {
					status: 'Failure',
					message: 'Error while creating the purchase order',
					error: purchaseOrder.error,
					errorTrace: purchaseOrder.errorTrace
				};
			} else {
				result = {
					status: 'success',
					message: 'Purchase order created successfully',
					purchaseOrder: purchaseOrder
				};
			}
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		})
})

app.post('/createShipment', (req, res) => {
	createShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN, req.body.organisationRole).then((shipment) => {
		console.log('Creating Shipment');
		var result;
		if (shipment.error) {
			result = {
				status: 'Failure',
				message: 'Error while creating shipment',
				error: shipment.error,
				errorTrace: shipment.errorTrace
			};
		} else {
			result = {
				status: 'success',
				message: 'Shipment created successfully',
				shipment: shipment
			};
		}
		res.status(500).send(result);
	})
})

app.post('/updateShipment', (req, res) => {
	updateShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN, req.body.organisationRole).then((shipment) => {
		console.log('Updating Shipment');
		var result;
		if (shipment.error) {
			result = {
				status: 'Failure',
				message: 'Error while updating shipment',
				error: shipment.error,
				errorTrace: shipment.errorTrace
			};
		} else {
			result = {
				status: 'success',
				message: 'Shipment updated successfully',
				shipment: shipment
			};
		}
		res.status(500).send(result);
	})
})

app.post('/retailDrug', (req, res) => {
	retailDrug.execute(req.body.drugName, req.body.serialNo, req.body.retailerCRN, req.body.customerAadhar, req.body.organisationRole).then((drug) => {
			console.log('Drug Retail');
			var result;
			if (drug.error) {
				result = {
					status: 'Failure',
					message: 'Error while updating Drug asset details',
					error: drug.error,
					errorTrace: drug.errorTrace

				};
			} else {
				result = {
					status: 'success',
					message: 'Drug details updated successfully',
					drug: drug
				};
			}
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		})
})

app.post('/viewDrugCurrentState', (req, res) => {
	viewDrugCurrentState.execute(req.body.drugName, req.body.serialNo, req.body.organisationRole).then((drug) => {
			console.log('View current state of the given Drug');
			var result;
			if (drug.error) {
				result = {
					status: 'Failure',
					message: 'Unable to fetch Drug asset details',
					error: drug.error,
					errorTrace: drug.errorTrace
				};
			} else {
				result = {
					status: 'success',
					message: 'Drug details fetched successfully',
					drug: drug
				};
			}
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		})
})

app.post('/viewHistory', (req, res) => {
	viewHistory.execute(req.body.drugName, req.body.serialNo, req.body.organisationRole).then((drug) => {
			console.log('View history of transaction on the drug');
			var result;
			if (drug.error) {
				result = {
					status: 'Failure',
					message: 'Unable to fetch Drug asset transaction history',
					error: drug.error,
					errorTrace: drug.errorTrace
				};
			} else {
				result = {
					status: 'success',
					message: 'Drug transaction history fetched successfully',
					drug: drug
				};
			}
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		})
})

app.listen(port, () => console.log(`Pharma Network App listening on port ${port}!`));
