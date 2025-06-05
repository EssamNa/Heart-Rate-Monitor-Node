const mongo = require('mongodb').MongoClient;
const mongo_oid = require('mongodb').ObjectID;
const config = require('../config/app_config.js');
const logger = require('./logger.js');
const {ObjectId} = require('mongodb');


let databaseHandler;
let heartRateCollection;

const hr_database = "heartRateData";


exports.init = async () => {  

    try {
        databaseHandler = await connectMongo();
        heartRateCollection = await getCollection(databaseHandler, hr_database);
    }
    catch (error) {
        process.exit(1);

    }

};

let connectMongo = () => {
    return new Promise((resolve, reject) => {
      mongo.connect(config.mongo_credentials, {
          ssl: true,
          sslValidate: false,
          tls: true,
          useNewUrlParser: true,
          tlsAllowInvalidCertificates: false,
          useUnifiedTopology: true
        }, function(err,database){  
            if(err) { throw Error(err); }
            else {
              resolve(database.db(config.database_name));
            }
          });
    });
};



let getCollection = (db, name) => {
    return new Promise((resolve, reject) => {
        db.collection(name, function(err,collection){
            if (err) reject (error);
            resolve(collection);
        });
    });
};


    async function saveHeartRateData(data) {
        var heartRateData = {heartRate: data.heartRate, timestamp: new Date(data.timestamp)};
        return new Promise((resolve, reject) => {
            // stop saving data to database
            heartRateCollection.insertOne(heartRateData,
                function (error, result) {
                    if (error) reject(error);
                    else resolve({
                        _id: result["ops"][0]["_id"],
                        heartRate: data.heartRate,
                        timestamp: data.timestamp
                      });
            });
            //resolve({heartRate: data.heartRate, timestamp: data.timestamp})
        });
  }

  async function  getHistoricalData(timeRange, limit = 1000) {
    return new Promise((resolve, reject) => {
        heartRateCollection.find({
          timestamp: {
            $gte: timeRange.start,
            $lte: timeRange.end
          }
        })
        .sort({timestamp: -1})
        .limit(limit)
        .toArray(function (error, data) {
            if (error) {
                resolve([]);
            } else {
                const returnedData = data.map(item => ({
                    _id: item._id.toString(),
                    heartRate: item.heartRate,
                    timestamp: item.timestamp
                  }));
                resolve(returnedData);
            }
        });
        //resolve([]);
    });
  }

  async function getStats(timeRange) {
    return new Promise((resolve, reject) => {
      const pipeline = [
        {
          $match: {
            timestamp: {
              $gte: timeRange.start,
              $lte: timeRange.end
            }
          }
        },
        {
          $group: {
            _id: null,
            min: { $min: '$heartRate' },
            max: { $max: '$heartRate' },
            average: { $avg: '$heartRate' },
            count: { $sum: 1 }
          }
        }
      ];

      heartRateCollection.aggregate(pipeline).toArray(function (error, result) {
        if (error) {
          console.error('❌ Error calculating stats:', error);
          resolve({ min: 0, max: 0, average: 0, count: 0 });
        } else {
          if (result.length === 0) {
            resolve({ min: 0, max: 0, average: 0, count: 0 });
          } else {
            const stats = result[0];
            resolve({
              min: stats.min || 0,
              max: stats.max || 0,
              average: Math.round(stats.average || 0),
              count: stats.count || 0
            });
          }
        }
      });
    });
  }

  // New function for time range presets
  function getTimeRangePresets() {
    const now = new Date();
    return {
      '5min': {
        start: new Date(now.getTime() - 5 * 60 * 1000),
        end: now,
        label: 'Last 5 Minutes'
      },
      '15min': {
        start: new Date(now.getTime() - 15 * 60 * 1000),
        end: now,
        label: 'Last 15 Minutes'
      },
      '1hour': {
        start: new Date(now.getTime() - 60 * 60 * 1000),
        end: now,
        label: 'Last Hour'
      },
      '6hours': {
        start: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        end: now,
        label: 'Last 6 Hours'
      },
      '24hours': {
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        end: now,
        label: 'Last 24 Hours'
      },
      '7days': {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now,
        label: 'Last 7 Days'
      }
    };
  }

exports.saveHeartRateData = saveHeartRateData;
exports.getHistoricalData = getHistoricalData;
exports.getStats = getStats;



















