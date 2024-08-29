"use strict";

const {
    Contract
} = require("fabric-contract-api");

class TransferDrug extends Contract {
    constructor() {

        super("org.pharma-network.transferDrug");
    }

    async instantiate(ctx) {
        console.log("Pharmanet Chaincode is Instantiated");
    }

    /*

    createPO (buyerCRN, sellerCRN, drugName, quantity)

    Use Case: This function is used to create a Purchase Order (PO) to buy drugs,
    by companies belonging to ‘Distributor’ or ‘Retailer’ organisation.
    Validations:
    •	You need to make sure that the transfer of drug takes place in a hierarchical manner
    and no organisation in the middle is skipped.
    For example, you need to make sure that a retailer is able to purchase drugs only from a distributor
     and not from a manufacturing company.
    PO Data Model: A purchase order with the following fields is created:
    •	poID: Stores the composite key of the PO using which the PO is stored on the ledger.
     This key comprises the CRN number of the buyer and Drug Name, along with an appropriate namespace.
    •	drugName: Contains the name of the drug for which the PO is raised.
    •	quantity: Denotes the number of units required.
    •	buyer: Stores the composite key of the buyer.
    •	seller: Stores the composite key of the seller of the drugs.

    */


    async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {
        try {
            const poIDKey = ctx.stub.createCompositeKey("org.pharma-network.poIDKey", [
                buyerCRN,
                drugName,
            ]);

            //creating partial composite key for buyer and seller org to fetch details of both orgs
            const buyerCompKey = await ctx.stub.getStateByPartialCompositeKey(
                "org.pharma-network.companyId",
                [buyerCRN]
            );
            let buyerKey = await buyerCompKey.next();

            const sellerCompKey = await ctx.stub.getStateByPartialCompositeKey(
                "org.pharma-network.companyId",
                [sellerCRN]
            );
            let sellerKey = await sellerCompKey.next();

            let buyerOrgBuffer = await ctx.stub
                .getState(buyerKey.value.key)
                .catch((err) => {
                    console.log(err);
                });

            let buyerOrgDetails = JSON.parse(buyerOrgBuffer.toString());

            let sellerOrgBuffer = await ctx.stub
                .getState(sellerKey.value.key)
                .catch((err) => {
                    console.log(err);
                });

            let sellerOrgDetails = JSON.parse(sellerOrgBuffer.toString());

            //making sure hierarchy is followed when buying drug on the network.
            //Distributor can buy from Manufacturer  || Retailer can buy from Distributor || but retailer can't directly buy from Manufacturer
            if (
                (buyerOrgDetails.organisationRole === "Retailer" &&
                    sellerOrgDetails.organisationRole === "Distributor") ||
                (buyerOrgDetails.organisationRole === "Distributor" &&
                    sellerOrgDetails.organisationRole === "Manufacturer")
            ) {
                let newPOObj = {
                    poID: poIDKey,
                    drugName: drugName,
                    quantity: quantity,
                    buyer: buyerKey.value.key,
                    seller: sellerKey.value.key,
                };
                let poDataBuffer = Buffer.from(JSON.stringify(newPOObj));
                await ctx.stub.putState(poIDKey, poDataBuffer);
                return newPOObj;
            } else {
                return {
                    error: "Transfer of the drug is not allowed as middle is skipped. ",
                };
            }
        } catch (err) {
            return {
                error: "Unable to create PO on the network, check input parameters",
                errorTrace: err.toString()
            };
        }

    }

    /*

    createShipment (buyerCRN, drugName, listOfAssets, transporterCRN )

    Use Case: After the buyer invokes the createPO transaction, the seller invokes
    this transaction to transport the consignment via a transporter corresponding to each PO.
    Validations:
    •	The length of ‘listOfAssets’ should be exactly equal to the quantity specified in the PO.
    •	The IDs of the Asset should be valid IDs which are registered on the network.
    Shipment Data Model: Based on the PO, a shipment object will get created with the following details:
    •	shipmentID: Composite key of the shipment asset, which will be used to store the shipment asset on the ledger.
     This composite key is created using the buyer’s CRN and the drug’s name along with appropriate namespace.
    •	creator: Key of the creator of the transaction.
    •	assets: A list of the composite keys of all the assets that are being shipped in this consignment.
     For example, if three strips of ‘paracetamol’ are being shipped in a batch, then
     the composite keys of all these three strips will be contained in this field.
    •	transporter: The composite key of the transporter, created using transporterName and transporterCRN
     along with appropriate namespace.
    •	status: This field can take two values: ‘in-transit’ and ‘delivered’.
    The status of the shipment will be ‘in-transit’ as long the asset does not get delivered to the system.
    As soon as the package is delivered, the status will change to ‘delivered’.
    Note: The owner of each item of the batch should also be updated.

    */

    async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN) {
        //creating comp key for shipment to store shipment onj on ledger
        try {
            const shipmentKey = await ctx.stub.createCompositeKey(
                "org.pharma-network.shipmentKey",
                [buyerCRN, drugName]
            );

            //partial key of drug to update drug owner
            let poIDCompKey = await ctx.stub.getStateByPartialCompositeKey(
                "org.pharma-network.poIDKey",
                [buyerCRN]
            );

            let poIDKey = await poIDCompKey.next();

            let poIDBuffer = await ctx.stub.getState(poIDKey.value.key).catch((err) => {
                console.log(err);
            });

            let poIDDetails = JSON.parse(poIDBuffer.toString());

            const transporterCompKey = await ctx.stub.getStateByPartialCompositeKey(
                "org.pharma-network.companyId",
                [transporterCRN]
            );
            let transporterKey = await transporterCompKey.next();


            let listOfAssetArray = listOfAssets.split(",");
            let assets = [];

            if (listOfAssetArray.length == poIDDetails.quantity) {
                try {
                    for (let i = 0; i < listOfAssetArray.length; i++) {
                        let drugCompKey = await ctx.stub.getStateByPartialCompositeKey(
                            "org.pharma-network.productIDKey",
                            [listOfAssetArray[i]]
                        );
                        let drugKey = await drugCompKey.next();

                        assets.push(drugKey.value.key);
                        let drugKeyDetail = await ctx.stub
                            .getState(drugKey.value.key)
                            .catch((err) => {
                                console.log(err);
                            });

                        let drugKeyBuffer = JSON.parse(drugKeyDetail.toString());
                        drugKeyBuffer.owner = transporterKey.value.key;
                    }
                } catch (err) {
                    console.log(err + "Drug validation failed");
                }
            } else {
                return {
                    error: "Invalud drug Quantity /drug ID",
                };
            }

            let newShipmentObj = {
                shipmentID: shipmentKey,
                creator: poIDDetails.seller,
                assets: assets,
                transporter: transporterKey.value.key,
                status: "in-transit",
            };
            let shipmentDataBuffer = Buffer.from(JSON.stringify(newShipmentObj));
            await ctx.stub.putState(shipmentKey, shipmentDataBuffer);
            return newShipmentObj;
        } catch (err) {
            return {
                error: "Unable to create Shipment on the network",
                errorTrace: err.toString()
            };
        }
    }

    /*
updateShipment( buyerCRN, drugName, transporterCRN)

Use Case: This transaction is used to update the status of the shipment to ‘Delivered’ when
the consignment gets delivered to the destination.
Validations:
•	This function should be invoked only by the transporter of the shipment.
Outcomes:
•	The status of the shipment is changed to ‘delivered’.
•	The composite key of the shipment object is added to the shipment list
which is a part of each item of the consignment.
 For example, imagine there are 10 strips of ‘paracetamol’ in a particular consignment.
 When this consignment is delivered to the buyer, then
 each item of the consignment is updated with the shipment object’s key.
Note: Refer to the note added in the definition for addDrug() transaction.
•	The owner field of each item of the consignment is updated.

 */

    async updateShipment(ctx, buyerCRN, drugName, transporterCRN) {


        try {
          if (ctx.clientIdentity.getMSPID() != "transporterMSP") {
                 return {
                     error: "Only Transporter can invoke this function"
                 };
           }

            const shipmentKey = await ctx.stub.createCompositeKey(
                "org.pharma-network.shipmentKey",
                [buyerCRN, drugName]
            );

            let shipmentBuffer = await ctx.stub.getState(shipmentKey).catch((err) => {
                console.log(err);
            });

            let shipmentDetail = JSON.parse(shipmentBuffer.toString());

            shipmentDetail.status = "delivered";

            const buyerCompKey = await ctx.stub.getStateByPartialCompositeKey(
                "org.pharma-network.companyId",
                [buyerCRN]
            );
            let buyerKey = await buyerCompKey.next();
            let resultArray = [];
            try {
                for (let i = 0; i < shipmentDetail.assets.length; i++) {
                    let drugKey = shipmentDetail.assets[i];

                    let drugBuffer = await ctx.stub.getState(drugKey).catch((err) => {
                        console.log(err);
                    });
                    let drugDetail = JSON.parse(drugBuffer.toString());
                    //fetching each drug from assets and updating its shipment and owner keys...
                    drugDetail.shipment = shipmentKey;
                    drugDetail.owner = buyerKey.value.key;
                    let drugDetailBuffer = Buffer.from(JSON.stringify(drugDetail));
                    resultArray.push(drugDetail);
                    await ctx.stub.putState(drugKey, drugDetailBuffer);
                }
            } catch (err) {
                console.log(err + " updating drug owner failed");
            }
            let shipmentDataBuffer = Buffer.from(JSON.stringify(shipmentDetail));
            await ctx.stub.putState(shipmentKey, shipmentDataBuffer);
            return resultArray;
        } catch (err) {
            return {
                error: "failed to update Shipment on the network",
                errorTrace: err.toString()
            };
        }
    }

    /*

  	retailDrug (drugName, serialNo, retailerCRN, customerAadhar)

  	Use Case: This transaction is called by the retailer while selling the drug to a consumer.
  	Validations:
  	•	This transaction should be invoked only by the retailer, who is the owner of the drug.
  	Outcomes:
  	•	Ownership of the drug is changed to the Aadhar number of the customer.
  	Note: For this transaction, no PO creation is required.

  	*/


    async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {
        try {

            const retailerCompKey = await ctx.stub.getStateByPartialCompositeKey(
                "org.pharma-network.companyId",
                [retailerCRN]
            );
            let companyKey = await retailerCompKey.next();


            const drugKey = await ctx.stub.createCompositeKey(
                "org.pharma-network.productIDKey",
                [serialNo, drugName]
            );
            let drugBuffer = await ctx.stub.getState(drugKey).catch((err) => {
                console.log(err);
            });
            let drugDetail = JSON.parse(drugBuffer.toString());

            console.log(drugDetail.owner + "company key " + companyKey.value.key);

            //making sure retailer who invoke the functions owns the Drug:
            if (drugDetail.owner != companyKey.value.key) {
                return {
                    error: "Drug Owner does not match with Retailer",
                };
            }

            drugDetail.owner = customerAadhar;
            let drugBufferUpdate = Buffer.from(JSON.stringify(drugDetail));
            await ctx.stub.putState(drugKey, drugBufferUpdate);
            return drugDetail;
        } catch (err) {
            return {
                error: "Unable to retail Drug on the network, check input parameters",
                errorTrace: err.toString()
            };
        }
    }
}
module.exports = TransferDrug;
