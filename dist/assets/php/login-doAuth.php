<?php

/*

  THIS IS A PASSTHROUGH TO GET AROUND CORS SHENANIGANS ON SAFARI
 *
 *
 */

$POST = json_decode(file_get_contents("php://input"), 1);

$url = 'http://checklinked.co/ajax/login-doAuth.php';
$fields = [
	'user' => $POST['user'],
	'pass' => $POST['pass'],
	'm' => $POST['m'],
	't' => $POST['t']
];

$fields_string = json_encode($fields);

//open connection
$ch = curl_init();

//set the url, number of POST vars, POST data
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, count($fields));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
	'Content-Type: application/json',
	'Content-Length: ' . strlen($fields_string)
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

//execute post
$result = curl_exec($ch);

//close connection
curl_close($ch);

die($result);
