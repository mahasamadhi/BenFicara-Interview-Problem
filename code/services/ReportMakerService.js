const config = require('../config');
const fs = require('fs');


class ReportMaker {
    
    constructor() {
    }

    writeToFile(report) {
        fs.writeFile('../reports/report.txt', report, { flag: "a+" }, (err)=>{
            if (err)
            console.log(err);
          else {
            console.log("File written successfully\n");
          }
        })
    }

    checkReportHistory(report_header) {
        const contents = fs.readFileSync('../reports/report.txt', "utf8")
        if (!contents) {
            fs.writeFile('../reports/report.txt', report_header, (err)=>{
                if (err)
                console.log(err);
              else {
                console.log("File written successfully\n");
                return
              }
            })
        } else {
            return
        }
    }

    appendReportHeader(report_header) {
            fs.writeFile('../reports/report.txt', report_header, (err)=>{
                if (err)
                console.log(err);
              else {
                console.log("File written successfully\n");
                return
              }
            })
        }
    

    reportError(error) {
      fs.writeFile('../reports/report.txt', JSON.stringify("Error Message:"+error.message), { flag: "a+" }, (err)=>{
        if (err) {
          console.log(err);
          return err
        }
        else {
          console.log("Error written to file successfully\n");
          return
        }
    })
    }
}

module.exports = ReportMaker