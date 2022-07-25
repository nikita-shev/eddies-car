<?php

require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';
require 'phpmailer/Exception.php';

$name = $_POST['name'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$article = $_POST['article'];

$mail = new PHPMailer\PHPMailer\PHPMailer();
try {
    $msg = '<div class="form-result">Мы перезвоним вам через 15 минут</div>';
    $mail->isSMTP();
    $mail->CharSet = "UTF-8";
    $mail->SMTPAuth   = true;
    $mail->Host       = 'smtp.gmail.com';
    $mail->Username   = '';
    $mail->Password   = '';
    $mail->SMTPSecure = 'ssl';
    $mail->Port       = 465;
    $mail->setFrom('nikitashevchenko134@gmail.com', 'Ремонт квартир');
    $mail->addAddress('nikitashevchenko134@gmail.com');

    // -----------------------
    // Само письмо
    // -----------------------
    $mail->isHTML(true);

    $mail->Subject = 'Новая заявка';
    $mail->Body    = "<b>Имя:</b> $name <br><b>Телефон:</b> $phone<br><b>E-mail:</b> $email<br><b>Артикул:</b> $article";

    if ($mail->send()) {
        echo "$msg";
    } else {
        echo "Сообщение не было отправлено. Неверно указаны настройки вашей почты";
    }
} catch (Exception $e) {
    echo "Сообщение не было отправлено. Причина ошибки: {$mail->ErrorInfo}";
}
