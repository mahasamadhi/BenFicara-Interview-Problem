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

//getReportData() is the main function of the program
//it makes use of a "data service" to make individual API calls
//and a report service to write the result to a file

async function getReportData() {

  try {
         // get all of the emails listed at: https://api.myngp.com/v2/broadcastEmails
    var allEmailsDetail = [];
    var allEmails = await dataService.getBroadCastEmails();
        //-sorts them descending by id
    allEmails = allEmails.items.sort((a, b) => {
      return b.emailMessageId - a.emailMessageId;
    });
    //-gets the details of each email from: https://api.myngp.com/v2/broadcastEmails/{emailMessageId}
    for (z = 0; z < allEmails.length; z++) {
      if(z === 0) {console.log('Fetching Email Details...')}
      allEmailsDetail.push(
        await dataService.getOneEmail(allEmails[z].emailMessageId)
      );
    }
    await Promise.all(allEmailsDetail);
    //get variants for each email
    for (var i = 0; i < allEmailsDetail.length; i++) {
      if(i === 0) {console.log('Fetching Email Variants...')}
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
      //best variant was found, remove unneeded variants

      delete allEmailsDetail[i].variants;
    }
    //create report object
    var final = Object.create({});
    final.Report_Title = reportTitle;
    final.Generated_On = `${formatDate(new Date())}`;
    final.Total_number_of_emails = allEmailsDetail.length;
    final.emails = allEmailsDetail;
    return final;
  } catch (err) {
    //if error ... write it to report
    reportMaker.reportError(err)
    console.log(err)
    
  }
}

async function generateReport() {
  //check if any reports have been generated yet
  //if not, generate a new header for the report
  reportMaker.checkReportHistory(
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
  //write report to file
  reportMaker.writeToFile(reportString);
  return;
  //done
}


generateReport();
