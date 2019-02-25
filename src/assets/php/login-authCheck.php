<?php

/*

  THIS IS A PASSTHROUGH TO GET AROUND CORS SHENANIGANS ON SAFARI
 *
 *
 */
//$url = 'http://checklinked.co/ajax/login-authCheck.php';
$url = 'https://checklinked.azurewebsites.net/api_security/ajax/login-authCheck.php';

//open connection
$ch = curl_init();

//set the url, number of POST vars, POST data
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POSTFIELDS, null);
curl_setopt($ch, CURLOPT_POST, false);
curl_setopt($ch, CURLOPT_HTTPGET, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);

//execute post
$result = curl_exec($ch);

//close connection
curl_close($ch);

die($result);
