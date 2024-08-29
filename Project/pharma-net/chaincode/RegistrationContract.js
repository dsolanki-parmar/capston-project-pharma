"use strict";

const {
  Contract
} = require("fabric-contract-api");

class RegistrationContract extends Contract {
  constructor() {
    //name of the Smart Contract => registration
    super("org.pharma-network.registration");
  }
  //All the custom functions are listed below

  // This is a basic user defined function used at the time of instantiating the smart contract
  // to print the success message on console
  async instantiate(ctx) {
    console.log("Pharmanet Chaincode is Instantiated");
  }

  /* Register Company
  Use Case: This transaction/function will be used to register new entities on the ledger.
  For example, for “VG pharma” to become a distributor on the network, it must register itself on the ledger using this transaction.
  Company Data Model: The company asset will have the following data model:
  •	companyID: This field stores the composite key with which the company will get registered on the network.
   The key comprises the Company Registration Number (CRN) and the Name of the company along with appropriate namespace.
   CRN is a unique identification number allotted to all the registered companies.
   For this use case, you are free to use any random sequence of characters for the CRN number.
  •	name: Name of the company
  •	location: Location of the company
  •	organisationRole: This field will take either of the following roles:
  o	Manufacturer
  o	Distributor
  o	Retailer
  o	Transporter
  •	hierarchyKey: This field will take an integer value based on its position in the supply chain.
  The hierarchy of the organisation is as follows:
  Manufacturer (1st level) → Distributor (2nd level) → Retailer (3rd level).
  For example, the value of this field for “VG Pharma”, which is a distributor in the supply chain, will be ‘2’.
  Note: There will be no hierarchy key for transporters.

  */
  async registerCompany(
    ctx,
    companyCRN,
    companyName,
    location,
    organisationRole
  ) {

    if('consumerMSP'==ctx.clientIdentity.mspId){
        throw new Error('You are not authorized to perform this operation');
}
    try {
      //create composite key companyidy
      const companyIdKey = ctx.stub.createCompositeKey(
        "org.pharma-network.companyId",
        [companyCRN, companyName]
      );

      //get the state from ledger to check if the company already exist
      let fetchCompanyDetail = await ctx.stub
        .getState(companyIdKey)
        .catch((err) => console.log(err));

      //to check if a company is already registered with the given CRN
      try {

        let fetchCompanyData = JSON.parse(fetchCompanyDetail.toString());
        return {
          error: "Company already exist"
        };
      } catch (err) {
        let hierarchyKey;
        let newCompanyObject;
        if (
          organisationRole == "Manufacturer" ||
          organisationRole == "Distributor" ||
          organisationRole == "Retailer"
        ) {
          if (organisationRole == "Manufacturer") {
            hierarchyKey = 1;
          } else if (organisationRole == "Distributor") {
            hierarchyKey = 2;
          } else {
            hierarchyKey = 3;
          }

          newCompanyObject = {
            companyID: companyIdKey,
            name: companyName,
            location: location,
            organisationRole: organisationRole,
            hierarchyKey: hierarchyKey,
          };

          //Hierarchy Key is only added for Manufacturer,Retailer and Distributor and not for Transporter
        } else if (organisationRole == "Transporter") {
          newCompanyObject = {
            companyID: companyIdKey,
            name: companyName,
            location: location,
            organisationRole: organisationRole,
          };
        } else {
          return {
            error: "Please enter valid organization role"
          };
        }

        let dataBuffer = Buffer.from(JSON.stringify(newCompanyObject));
        console.log(newCompanyObject);
        await ctx.stub.putState(companyIdKey, dataBuffer);

        return newCompanyObject;
      }
    } catch (err) {
      return {
        error: "Unable to execute the function to register the Org, please make sure input parameters are correct.",
        errorTrace: err.toString()
      };
    }
  }
}
module.exports = RegistrationContract;
