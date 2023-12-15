const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const verifyToken = require('./verifyToken');
var sql = require("mssql");
const app = express();
app.options('*', cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Enable CORS for all routes
app.use(cors({ origin: '*' }));

// Enable CORS for a specific route (OPTIONS method)
// app.options('http://192.168.1.114:8081', cors());

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.port || process.env.PORT || 6565;

var config = {
  user: 'db_aa1d65_nodeserver_admin',
  password: '12345678_Har',
  server: 'SQL5110.site4now.net',
  database: 'db_aa1d65_nodeserver',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// var config = {
//   user: 'sa',
//   password: 'CRMEnergy4084',
//   server: '192.168.70.138',
//   database: 'EZ_CRM_Acc',
//   options: {
//     encrypt: true,
//     trustServerCertificate: true,
//   },
// };

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === 'admin' && password == '123456') {
    // Generate a token
    const token = jwt.sign({ username }, 'H_154&^!!@$');  // Change 'your_secret_key' to your actual secret key

    // Send the token as response
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/getServerList', verifyToken, async (req, res) => {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    const userRoleRes = await request.query(`select * from ApplicationSettings where ConfigKey='BGUpdateTime'`);
    res.json({
      flag: 1,
      status: 200,
      message: 'ServerList fetched successfully.',
      data: userRoleRes.recordset
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetched ServerList." })
  } finally {
    sql.close();
  }
});

app.get('/getPushNotificationList', verifyToken, async (req, res) => {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    const userRoleRes = await request.query(`select * from ScraperJob_Push_Notification`);
    res.json({
      flag: 1,
      status: 200,
      message: 'ScraperJob Push Notification fetched successfully.',
      data: userRoleRes.recordset
    });
  } catch (error) {
    console.log('getPushNotificationList', error)
    res.status(500).json({ error: "An error occurred while fetched Push Notification." })
  } finally {
    sql.close();
  }
});

app.get('/getErrorJobList', verifyToken, async (req, res) => {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    const userRoleRes = await request.query(`SELECT  Top 10 *
    FROM ScraperJobs
    WHERE ID NOT IN (SELECT JobId FROM ScraperJob_Push_Notification) ORDER BY ID DESC`);
    res.json({
      flag: 1,
      status: 200,
      message: 'ServerList fetched successfully.',
      data: userRoleRes.recordset
    });
  } catch (error) {
    console.log('getErrorJobList error', error);
    res.status(500).json({ error: "An error occurred while fetched Error Job List." })
  } finally {
    sql.close();
  }
});

app.get('/getErrorJobListByID/:id', verifyToken, async (req, res) => {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    const userRoleRes = await request.query(`select * from ScraperJobs where id = ${req.params.id}`);
    res.json({
      flag: 1,
      status: 200,
      message: 'ServerList fetched successfully.',
      data: userRoleRes.recordset
    });
  } catch (error) {
    console.log('getErrorJobList error', error);
    res.status(500).json({ error: "An error occurred while fetched Error Job List." })
  } finally {
    sql.close();
  }
});

app.get('/getErrorJobData', verifyToken, async (req, res) => {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    const userRoleRes = await request.query(`SELECT  Top 50 *
    FROM ScraperJobs ORDER BY ID DESC`);
    res.json({
      flag: 1,
      status: 200,
      message: 'Error Job Data fetched successfully.',
      data: userRoleRes.recordset
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetched Error Job List." })
  } finally {
    sql.close();
  }
});


app.post('/updateJobStatus', verifyToken, async (req, res) => {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    console.log('mail', req.body.IsSentMail);
    console.log('mail', req.body.ID);
    const userRoleRes = await request.query(`UPDATE ScraperJobs SET IsSentMail = ${req.body.IsSentMail} WHERE ID = ${req.body.ID} `);
    res.json(
      {
        flag: 1,
        status: 200,
        message: 'ScraperJob status updated successfully.',
        data: userRoleRes.recordset
      }
    );
  } catch (error) {
    res.status(500).json(
      {
        error: "An error occurred while updated record."
      })
  } finally { sql.close(); }
});

app.post('/insertRecordInSet', verifyToken, async (req, res) => {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    console.log('req.body', req.body)
    const userRoleRes = await request.query(`INSERT INTO ScraperJob_Push_Notification (IsSentMail,JobId) VALUES (${req.body.IsSentMail},${req.body.JobId})`);
    res.json(
      {
        flag: 1,
        status: 200,
        message: 'mail record added successfully.',
        data: userRoleRes.recordset
      }
    );
  } catch (error) {
    console.log('error', error);
    res.status(500).json(
      {
        error: "An error occurred while add mail record."
      })
  } finally { sql.close(); }
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});

