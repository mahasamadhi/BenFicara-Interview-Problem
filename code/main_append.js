const config = require("./config");
const fetch = require("node-fetch");
const ReportMaker = require("./services/ReportMakerService.js");
const formatDate = require("./services/DateService");
const DataService = require("./services/DataService");

let dataService = new DataService();
const reportMaker = new ReportMaker();
const tripleLineFeed = "\n\n\n"
const reportHeader = '*****NGP 7 Broadcast Emails Report History******'
const reportTitle = `Broadcast Emails report`
//this is the main function of the program
//it makes use of a "data service" to make individual API calls

async function getReportData() {
  //-this function gets all of the emails listed at: https://api.myngp.com/v2/broadcastEmails
  //-sorts them descending by id
  //-gets the details of each email from: https://api.myngp.com/v2/broadcastEmails/{emailMessageId}
  //-chooses the best variant based on # of opens
  try {
    var allEmailsDetail = [];
    var allEmails = await dataService.getBroadCastEmails();
    allEmails = allEmails.items.sort((a, b) => {
      return b.emailMessageId - a.emailMessageId;
    });

    for (z = 0; z < allEmails.length; z++) {
      allEmailsDetail.push(
        await dataService.getOneEmail(allEmails[z].emailMessageId)
      );
    }
    await Promise.all(allEmailsDetail);
//get variants for each email
    for (var i = 0; i < allEmailsDetail.length; i++) {
      var promiseVariantList = [];
      for (var x = 0; x < allEmailsDetail[i].variants.length; x++) {
        promiseVariantList.push(
          await dataService.getOneEmailVariant(
            allEmailsDetail[i].emailMessageId,
            allEmailsDetail[i].variants[x].emailMessageVariantId
          )
        );
      }
      await Promise.all(promiseVariantList);
      //choose best variant based on # of opens
      var bestVariantSorted = promiseVariantList.sort((a, b) => {
        return a.statistics.opens - b.statistics.opens;
      });
      allEmailsDetail[i].bestVariant = bestVariantSorted.pop().name;
      delete allEmailsDetail[i].variants;
    }

    var final = Object.create({});
    final.Report_Title = reportTitle;
    final.Generated_On = `${formatDate(new Date())}`;
    final.Total_number_of_emails = allEmailsDetail.length;
    final.emails = allEmailsDetail;
    return final;
  } catch (err) {
    reportMaker.reportError(err)
    console.log(err)
    
  }
}

async function generateReport() {
  //check if any reports have been generated yet
  //if not, generate a title for the report

  reportMaker.checkReportHistory(
      //report header
    `${reportHeader}${tripleLineFeed}`
  );

  //call the main function and stringify so it's writable to text file
  const reportData = await getReportData()
  //if theres no data then there was an error
  //error written to report file
  if(!reportData) {
      return
    } 
  const reportString = JSON.stringify(reportData, null, 3) + tripleLineFeed;
  reportMaker.writeToFile(reportString);
  return;
}


generateReport();
