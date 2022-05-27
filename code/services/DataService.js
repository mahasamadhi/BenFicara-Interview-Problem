const config = require("../config");
const fetch = require("node-fetch");
const ReportMaker = require("./ReportMakerService.js");


class DataService {
  constructor() {}

  options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      apiKey:
        config.KEY,
    },
  };

  async getBroadCastEmails() {

    try {
      const res = await fetch(
        "https://api.myngp.com/v2/broadcastEmails",
        this.options
      );
      if(res.status === 401) {
        throw Error('401 Unauthorized! Check your API key and Username')
      }
      return res.json()
    } catch (err) {
      throw err; 
    }
  }

  async getOneEmail(emailId) {
    try {
      const res = await fetch(
        `https://api.myngp.com/v2/broadcastEmails/${emailId}?$expand=statistics`,
        this.options
      );
      return res.json();
    } catch (err) {
      console.error(err);
      return err;
    }
  }
  async getOneEmailVariant(emailId, variantId) {
    try {
      const res = await fetch(
        `https://api.myngp.com/v2/broadcastEmails/${emailId}/variants/${variantId}?$expand=statistics`,
        this.options
      );

      return res.json()
    } catch (err) {
      console.error(err);
      return err;
    }
  }



}

module.exports = DataService

