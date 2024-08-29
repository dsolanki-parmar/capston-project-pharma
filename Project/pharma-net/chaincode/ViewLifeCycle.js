"use strict";

const {
  Contract
} = require("fabric-contract-api");

class ViewLifeCycle extends Contract {
  constructor() {
    //name of the Smart Contract => registration
    super("org.pharma-network.viewLifeCycle");
  }

  //All the custom functions are listed below

  // This is a basic user defined function used at the time of instantiating the smart contract
  // to print the success message on console

  async instantiate(ctx) {
    console.log("Pharmanet Chaincode is Instantiated");
  }
  /*
  viewHistory (drugName, serialNo)

  Description:
  •	This transaction will be used to view the lifecycle of the product by
   fetching transactions from the blockchain.
  •	The function should return the transaction id along with the details of the asset
   for every transaction associated with it.
  */


  async viewHistory(ctx, drugName, serialNo) {
    try {
      const productIDKey = ctx.stub.createCompositeKey(
        "org.pharma-network.productIDKey",
        [serialNo, drugName]
      );

      //getting history using getHistoryForKey passing productIDKey(drug composite key)
      let resultsIterator = await ctx.stub.getHistoryForKey(productIDKey);
      let allResults = [];
      while (true) {
        let res = await resultsIterator.next();
        if (res.value && res.value.value.toString()) {
          let jsonRes = {};
          console.log(res.value.value.toString("utf8"));

          jsonRes.TxId = res.value.tx_id;
          jsonRes.Timestamp = res.value.timestamp;
          jsonRes.IsDelete = res.value.is_delete.toString();
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString("utf8");
          }
          allResults.push(jsonRes);
        }
        if (res.done) {
          await resultsIterator.close();
          console.info(allResults);
          return allResults;
        }
      }
    } catch (err) {
      return {
        error: "Unable to fetch History of Drug asset on the network, check input parameters",
        errorTrace: err.toString()
      };
    }
  }


/*
viewDrugCurrentState (drugName, serialNo)

Description:
•	This transaction is used to view the current state of the Asset.

*/
  async viewDrugCurrentState(ctx, drugName, serialNo) {
    try {
      const productIDKey = ctx.stub.createCompositeKey(
        "org.pharma-network.productIDKey",
        [serialNo, drugName]
      );
      let dataBuffer = await ctx.stub.getState(productIDKey).catch((err) => {
        console.log(err);
      });
      return JSON.parse(dataBuffer.toString());
    } catch (err) {
      return {
        error: "Unable to view Current History of Drug asset on the network, check input parameters",
        errorTrace: err.toString()
      };
    }
  }
}
module.exports = ViewLifeCycle;
