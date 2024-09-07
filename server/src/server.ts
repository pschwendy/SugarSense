import dotenv from "dotenv";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { dexcom } from "./dexcom";
import { queries } from "./queries";

dotenv.config();

const app = express();
const port = 3000 || process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/../../app/build')));

// Route handler for react
app.get('*', async (req, res, next) => {
  res.clearCookie("pk");
  /*if(req.cookies.pk !== undefined && await queries.accessExpired(req.cookies.pk)) {
    const refreshToken = await queries.getRefeshToken(req.cookies.pk);
    dexcom.renew(refreshToken);
  }*/
  res.sendFile(path.join(__dirname + '/../../app/build/index.html'));
  next();
});

app.get('/api/login', async (req, res, next) => {
  console.log("---------here7----------");
  await dexcom.authorize(req.query.code as string, (pk: number) => {
    console.log(res.headersSent)
    res.cookie("pk", pk);
    console.log(res.statusCode);
    // res.redirect('/');
  });
  console.log("---------here8----------");
});

app.get('/api/egvs', (req, res, next) => {
  queries.getAccessToken(req.cookies["pk"])
  .then(accessToken => {
    dexcom.egvs(accessToken);
  })
});

// Hard coded data collection for testing out basic model
app.get('/api/collect', (req, res, next) => {
  dexcom.collectData('../training/data/data4.json', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI0ZjRhNzAwYS04ZDU0LTQ5ZGYtYTg4OS0zOWVhOGQ1MWZmYjIiLCJhdWQiOiJodHRwczovL3NhbmRib3gtYXBpLmRleGNvbS5jb20iLCJzY29wZSI6WyJlZ3YiLCJjYWxpYnJhdGlvbiIsImRldmljZSIsImV2ZW50Iiwic3RhdGlzdGljcyIsIm9mZmxpbmVfYWNjZXNzIl0sImlzcyI6Imh0dHBzOi8vc2FuZGJveC1hcGkuZGV4Y29tLmNvbSIsImV4cCI6MTcyNTY5MTk1MCwiaWF0IjoxNzI1Njg0NzUwLCJjbGllbnRfaWQiOiJKbE5menV3OTk2T0hMY09iM29abDAzRjNOeGFSNTEyZSJ9.2cZD6nl-DWdz2bvYJ3KZ-_k2n2HLQZYtFuQdzmlXwp1lRhirvU3RmENSjGkmIy_kDkE6YBz6yeLPLXlJKFhQTMLVtYVyGCkXejCxPGS-LbcYA6NEO45CjprUgqEYzVsGSDKChIZjWWSw6uw94fiFC7WI-rYcCRrIMEewtFqbRcfGzMr5titRW2zK_N7PQXPmCtdOg3dHqqavrxGNamz3IKgEm5QKNBH8jME_ewsdPKTYWMviQl_fUHYp9DpVBKBsoRK5CdpjBh8WESV2pv42FdRzf2cKGiWCCxoiKkTfU9kBih5A1pSqGc1g2xaoWJIr1g7oT-OPQT1-Gkpd9pxZaA');
  dexcom.collectData('../training/data/data5.json', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI5MzdjMjBjNy0yOThlLTQzNzgtODhiYS0zOWVhOGQ1MzIwMDgiLCJhdWQiOiJodHRwczovL3NhbmRib3gtYXBpLmRleGNvbS5jb20iLCJzY29wZSI6WyJlZ3YiLCJjYWxpYnJhdGlvbiIsImRldmljZSIsImV2ZW50Iiwic3RhdGlzdGljcyIsIm9mZmxpbmVfYWNjZXNzIl0sImlzcyI6Imh0dHBzOi8vc2FuZGJveC1hcGkuZGV4Y29tLmNvbSIsImV4cCI6MTcyNTY5MTk4NywiaWF0IjoxNzI1Njg0Nzg3LCJjbGllbnRfaWQiOiJKbE5menV3OTk2T0hMY09iM29abDAzRjNOeGFSNTEyZSJ9.obg8ePXHWKcvAy6cxLHvalhWbPTvF7fm2ZQVMYipJloN0rxUP0Qvopwd5hSjkMcdNZ0kRwDAniPQxZoLmuGgmimugcrAV8Iy_nX6znkyQgmqAT8Wrg9H0en5zalHWBg9KwGSMxd54UmVtdizaFQ-Tu3-ChLwbuKgv4oulDoO9pRkCbSEoWdZVvzqYfbS-K_yYHOkemXii9GSFxpriwwyG14303sOeOWfSo_G8STdJG-eV3GF3yP5l3RZlH730Um1PnSewUxokACnBmPJAE0A2wviaeH-eHxnoZJSxGToC0PhHi3ToZjEiT32HgPw77spzYr-yAJwaYxfshUidXTadw');
  dexcom.collectData('../training/data/data6.json', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI5NzljNGRhMS1mOTliLTRmZGYtOTg3Mi0zOWVhOGQ1NDM1OGEiLCJhdWQiOiJodHRwczovL3NhbmRib3gtYXBpLmRleGNvbS5jb20iLCJzY29wZSI6WyJlZ3YiLCJjYWxpYnJhdGlvbiIsImRldmljZSIsImV2ZW50Iiwic3RhdGlzdGljcyIsIm9mZmxpbmVfYWNjZXNzIl0sImlzcyI6Imh0dHBzOi8vc2FuZGJveC1hcGkuZGV4Y29tLmNvbSIsImV4cCI6MTcyNTY5MjA3NSwiaWF0IjoxNzI1Njg0ODc1LCJjbGllbnRfaWQiOiJKbE5menV3OTk2T0hMY09iM29abDAzRjNOeGFSNTEyZSJ9.1WZ5x5UBSm1526A-oLzixDc1Ok9ZCgeY-x2T02gnwjzWfS9D5Srtc5hj17jL20wSgG-712BqiS15H3rH7QmIHXrnV2hOtA_JuIgn6nPtkANre6fBwcAtCbdhgWhoGv3QozXAN_HqLXHcVPHE0nN4yfmSPkLbvdxHICyQ_ZVl9o2rfGXk6JEwbYEU0ksxFw_9aluRR9THT7YOeQ59_m79KrNpy5f3rNIPk7Bc6MNHWTRFfsuhytEjjNJjY1F-YCcBJBhNbitqXEyI8d8nijZ6e3PAsb0DePxj8mt-adBlUlO08cX1yY_-4U5TCXiTcfwFQAOhePFXR2Undzek_LrKDQ');
});

app.get('/api/events', (req, res, next) => {
  queries.getAccessToken(req.cookies["pk"])
  .then(accessToken => {
    console.log(accessToken);
    dexcom.egvs(accessToken);
  }).catch(err => {
    console.log("Something went wrong:");
    console.log(err);
  });
});

app.listen(port, () => {
  console.log( `Listening on localhost:${ port }` );
});