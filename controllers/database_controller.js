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
            /*heartRateCollection.insertOne(heartRateData,
                function (error, result) {
                    if (error) reject(error);
                    else resolve({
                        _id: result["ops"][0]["_id"],
                        heartRate: data.heartRate,
                        timestamp: data.timestamp
                      });
            });*/
            resolve({heartRate: data.heartRate, timestamp: data.timestamp})
        });
  }

  async function  getHistoricalData(timeRange, limit = 1000) {
    return new Promise((resolve, reject) => {
        /*heartRateCollection.find({
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
        });*/
        resolve([]);
    });
  }

  /*async function getStats(timeRange) {
    try {
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

      const result = await collections.heartRateData.aggregate(pipeline).toArray();
      
      if (result.length === 0) {
        return { min: 0, max: 0, average: 0, count: 0 };
      }

      const stats = result[0];
      return {
        min: stats.min || 0,
        max: stats.max || 0,
        average: Math.round(stats.average || 0),
        count: stats.count || 0
      };
    } catch (error) {
      console.error('❌ Error calculating stats:', error);
      throw error;
    }
  }*/

exports.saveHeartRateData = saveHeartRateData;
exports.getHistoricalData = getHistoricalData;
//exports.getStats = getStats;



















