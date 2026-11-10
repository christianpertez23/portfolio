<?php
// Server-side auth for XAMPP. Needs pdo_sqlite enabled in php.ini and a writable api/ folder.
session_set_cookie_params(['httponly'=>true,'samesite'=>'Lax']);
session_start();
header('Content-Type: application/json');
function out($a,$c=200){http_response_code($c);echo json_encode($a);exit;}
try{
  $db=new PDO('sqlite:'.__DIR__.'/users.sqlite');
  $db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
  $db->exec('CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,hash TEXT NOT NULL)');
}catch(Throwable $e){out(['error'=>'Database unavailable. Enable pdo_sqlite in php.ini and make the api folder writable.'],500);}
$a=$_GET['action']??'';
$in=json_decode(file_get_contents('php://input'),true)?:[];
$email=strtolower(trim($in['email']??''));
$pw=(string)($in['password']??'');
$name=trim($in['name']??'');
if($a==='me')out(['user'=>$_SESSION['user']??null]);
if($a==='logout'){$_SESSION=[];session_destroy();out(['ok'=>true]);}
if($a==='register'){
  if($name===''||!filter_var($email,FILTER_VALIDATE_EMAIL)||strlen($pw)<6)out(['error'=>'Enter your name, a valid email and a password of 6+ characters.'],400);
  try{$db->prepare('INSERT INTO users(name,email,hash) VALUES(?,?,?)')->execute([$name,$email,password_hash($pw,PASSWORD_DEFAULT)]);}
  catch(Throwable $e){out(['error'=>'That email is already registered. Try logging in.'],409);}
  session_regenerate_id(true);$_SESSION['user']=['name'=>$name,'email'=>$email];
  out(['user'=>$_SESSION['user']]);
}
if($a==='login'){
  $s=$db->prepare('SELECT name,hash FROM users WHERE email=?');$s->execute([$email]);$u=$s->fetch(PDO::FETCH_ASSOC);
  if(!$u||!password_verify($pw,$u['hash']))out(['error'=>'Wrong email or password.'],401);
  session_regenerate_id(true);$_SESSION['user']=['name'=>$u['name'],'email'=>$email];
  out(['user'=>$_SESSION['user']]);
}
out(['error'=>'Unknown action'],400);
