var spinner = $('.ymap-container').children('.loader');
var check_if_load = false;
var myMapTemp, myPlacemarkTemp;

function init () {
    var myMapTemp = new ymaps.Map("map-yandex", {
        center: [64.544543, 40.515403],
        zoom: 15,
        controls: ['zoomControl', 'fullscreenControl']
    });
    var myPlacemarkTemp = new ymaps.GeoObject({
        geometry: {
            type: "Point",
            coordinates: [64.544543, 40.515403]
        },

        properties: {
            balloonContent: 'Оригинальные запчасти для Белаз<br><i>Телефон</i>:<br><b>+7 (818) 247-47-25</b>'
        }
    });
    myMapTemp.geoObjects.add(myPlacemarkTemp);

    myMapTemp.behaviors.disable('scrollZoom');

    var layer = myMapTemp.layers.get(0).get(0);

    waitForTilesLoad(layer).then(function() {
        spinner.removeClass('is-active');
    });
}

function waitForTilesLoad(layer) {
    return new ymaps.vow.Promise(function (resolve, reject) {
        var tc = getTileContainer(layer), readyAll = true;
        tc.tiles.each(function (tile, number) {
            if (!tile.isReady()) {
                readyAll = false;
            }
        });
        if (readyAll) {
            resolve();
        } else {
            tc.events.once("ready", function() {
                resolve();
            });
        }
    });
}

function getTileContainer(layer) {
    for (var k in layer) {
        if (layer.hasOwnProperty(k)) {
            if (
                layer[k] instanceof ymaps.layer.tileContainer.CanvasContainer
                || layer[k] instanceof ymaps.layer.tileContainer.DomContainer
            ) {
                return layer[k];
            }
        }
    }
    return null;
}

function loadScript(url, callback){
    var script = document.createElement("script");

    if (script.readyState){  // IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

var ymap = function() {
    $('.ymap-container').mouseenter(function(){
            if (!check_if_load) {
                check_if_load = true;

                spinner.addClass('is-active');

                loadScript("https://api-maps.yandex.ru/2.1/?lang=ru_RU&amp;loadByRequire=1", function(){
                    ymaps.load(init);
                });
            }
        }
    );
}

$(function() {
    ymap();

    $('.btn-up').on('click', function () {
        $('body, html').animate({scrollTop: 0}, 500);
    });

    $(window).on("scroll", function() {
        if ($(window).scrollTop() > 150) $('.btn-up').addClass('btn-fix');
        else $('.btn-up').removeClass('btn-fix');
    });

    //Валидация
    $('#modal-dialog').validate({
        errorClass: "invalid invalid__modal",
        errorElement: "div",
        rules: {
            name: {
                required: true,
                minlength: 2,
                maxlength: 15
            },
            phone: {required: true}
        },
        messages: {
            name: {
                required: "Заполните поле",
                minlength: "Минимальное количество символов: 2",
                maxlength: "Максимальное количество символов: 15"
            },
            phone: {required: "Заполните поле",}
        }
    });

    $('.send-price__form').validate({
        errorClass: "invalid invalid__send-price",
        errorElement: "div",
        rules: {
            email: {required: true},
            phone: {required: true}
        },
        messages: {
            email: {required: "Заполните поле"},
            phone: {required: "Заполните поле"}
        }
    });

    $('.follow-price__form').validate({
        errorClass: "invalid invalid__follow-price",
        errorElement: "div",
        rules: {
            article: {
                required: true,
                minlength: 6,
                maxlength: 8
            },
            phone: {required: true}
        },
        messages: {
            article: {
                required: "Заполните поле",
                minlength: "Минимальное количество символов: 6",
                maxlength: "Максимальное количество символов: 8"
            },
            phone: {required: "Заполните поле"}
        }
    });

    $('.advice__form').validate({
        errorClass: "invalid invalid__follow-price",
        errorElement: "div",
        rules: {
            phone: {required: true}
        },
        messages: {
            phone: {required: "Заполните поле"}
        }
    });
    // Валидация END


    //Маска для телефона
    $('.phone').mask('+7 (999) 999-99-99');

    //Ajax form
    $('#modal-dialog').on('submit', function (e) {
        e.preventDefault();

        $.ajax({
            type: "POST",
            url: "template/mail.php",
            data: $(this).serialize(),
            beforeSend: function () {
                let  send = true;

                let pass = document.forms['modal-dialog'].elements['name'].value;
                if(pass.length<2 || pass.length>15) { return false }

                $('#modal-dialog input').each(function(){
                    if(!$(this).val() || $(this).val() == ''){
                        send = false;
                    }
                });

                if(!send) return false;
            },
            success: function (response) {
                $('.modal').removeClass('modal-active');
                $('.modal-status').addClass('modal-active');
                $('body').css('overflow', 'hidden');
                $('.form-result').remove();
                $('.modal-dialog__status h2').parent().append($(response));
                $('#modal-dialog')[0].reset();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR + " " + textStatus);
            }
        });
    });

    $('.send-price__form').on('submit', function (e) {
        e.preventDefault();

        $.ajax({
            type: "POST",
            url: "template/mail.php",
            data: $(this).serialize(),
            beforeSend: function () {
                let  send = true;

                const emailReg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
                      emailAddress = document.querySelector('.input__email').value,
                      inputEmail = document.querySelector('.input__email'),
                      divErr = document.querySelector('#email-error');

                if (!emailReg.test(emailAddress)) {
                    divErr.removeAttribute('style');
                    divErr.innerHTML = 'Заполните поле';

                    inputEmail.classList.add('invalid');
                    inputEmail.classList.remove('valid');

                    return false;
                }

                $('.send-price__form input').each(function(){
                    if(!$(this).val() || $(this).val() == ''){
                        send = false;
                    }
                });

                if(!send) return false;

                divErr.style.display = 'none';
            },
            success: function (response) {
                $('.modal-status').addClass('modal-active');
                $('body').css('overflow', 'hidden');
                if (screen.width > 992) { $('body').css('padding-right', '17px') }
                $('.form-result').remove();
                $('.modal-dialog__status h2').parent().append($(response));
                $('.send-price__form')[0].reset();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR + " " + textStatus);
            }
        });
    });

    const checkDivErr = ()=> {
        const invalidFollowPriceDiv = document.querySelector('div.invalid__follow-price'),
            divErr = document.querySelector('.invalid-modal'),

            articleLength = document.querySelectorAll('.follow-price__form input')[0];

        if (!invalidFollowPriceDiv) { divErr.removeAttribute('style'); }
        else if (!invalidFollowPriceDiv.getAttribute('style')) { divErr.style.display = 'none'; }
        else if (invalidFollowPriceDiv.innerHTML === '' && (articleLength.value.length >= 6 && articleLength.value.length <= 8)) { divErr.removeAttribute('style'); }
        else { divErr.style.display = 'none'; }
    };

    const articleInput = document.querySelector('.follow-price__form input');
    articleInput.addEventListener('input', ()=> { checkDivErr(); });


    $('.follow-price__form').on('submit', function (e) {
        e.preventDefault();

        $.ajax({
            type: "POST",
            url: "template/mail.php",
            data: $(this).serialize(),
            beforeSend: function () {
                let  send = true;

                const articleLength = document.querySelectorAll('.follow-price__form input')[0],
                      divErr = document.querySelector('#article-error');

                if (!(articleLength.value.length >= 6 && articleLength.value.length <= 8 && !isNaN(+articleLength.value))) {
                    checkDivErr();

                    articleLength.classList.add('invalid');
                    articleLength.classList.remove('valid');

                    return false
                }

                $('.follow-price__form input').each(function(){
                    if(!$(this).val() || $(this).val() == ''){
                        send = false;
                    }
                });

                if(!send) return false;

                divErr.style.display = 'none';
            },
            success: function (response) {
                $('.modal-status').addClass('modal-active');
                $('body').css('overflow', 'hidden');
                if (screen.width > 992) { $('body').css('padding-right', '17px'); }
                $('.form-result').remove();
                $('.modal-dialog__status h2').parent().append($(response));
                $('.follow-price__form')[0].reset();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR + " " + textStatus);
            }
        });
    });

    $('.advice__form').on('submit', function (e) {
        e.preventDefault();

        $.ajax({
            type: "POST",
            url: "template/mail.php",
            data: $(this).serialize(),
            beforeSend: function () {
                let send = true;

                $('.advice__form input').each(function(){
                    if(!$(this).val() || $(this).val() == ''){
                        send = false;
                    }
                });

                if(!send) return false;
            },
            success: function (response) {
                $('.modal-status').addClass('modal-active');
                $('body').css('overflow', 'hidden');
                if (screen.width > 992) { $('body').css('padding-right', '17px'); }
                $('.form-result').remove();
                $('.modal-dialog__status h2').parent().append($(response));
                $('.advice__form')[0].reset();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR + " " + textStatus);
            }
        });
    });
});

const body = document.querySelector('body'),
      modalActiveBtn = document.querySelector('.nav-bar__btn'),
      modal = document.querySelector('.modal'),
      modalDocument = document.querySelector('.modal-document'),
      documentImg = document.querySelector('.document__img'),
      modalCloseBtn = document.querySelector('.modal-dialog__btn'),
      modalStatus = document.querySelector('.modal-status'),
      modalStatusBtn = document.querySelector('.modal-status__btn');

modalActiveBtn.addEventListener('click', ()=> {
    modal.classList.add('modal-active');
    body.style.overflowY = 'hidden';
    if (screen.width > 992) { body.style.paddingRight = '17px'; }
});


const closeBtn = [modalCloseBtn, modal, modalStatus, modalStatusBtn, modalDocument];

const closeDocument  = (elem)=> {
    elem.closest('.modal-active').classList.remove('modal-active');
    body.removeAttribute('style');
};

closeBtn.forEach((item) => {
    item.addEventListener('click', (e)=> {
        const target = e.target;

        if (target.matches(`.${item.classList[0]}`)) { closeDocument(target); }
    })
});


const guaranteeBtn = document.querySelectorAll('.guarantee-wrap a'),
      guaranteeImg = document.querySelectorAll('.guarantee-wrap img');

const guaranteeTarget  = (items) => {
    items.forEach((item) => {
        item.addEventListener('click', (e)=> {
            e.preventDefault();
            modalDocument.classList.add('modal-active');
            body.style.overflowY = 'hidden';
            if (screen.width > 992) { body.style.paddingRight = '17px'; }

            const imgSrc = item.parentNode.querySelector('img').getAttribute('src');
            documentImg.setAttribute('src', imgSrc);
        })
    });
};

guaranteeTarget(guaranteeBtn);
guaranteeTarget(guaranteeImg);



const questionsListItem = document.querySelectorAll('.questions-list__item'),
      questionsModalClose = document.querySelector('.questions-modal__btn'),
      questionsModal = document.querySelector('.questions-modal'),
      questionsModalText = document.querySelector('.questions-modal__text'),
      questionsList = document.querySelector('.questions-list');

let targetLink;

const clearListStyle = ()=> { questionsListItem.forEach((clearItem) => { clearItem.removeAttribute('style'); }); };

questionsListItem.forEach((item, i)=> {
   item.addEventListener('click', (e)=> {
       e.preventDefault();
       const target = e.target;

       if (item.getAttribute('style')) {
           clearListStyle();
           questionsModal.classList.remove('modal-active');
           target.classList.remove('link-after');
       } else {
           clearListStyle();

           if (targetLink) { targetLink.classList.remove('link-after'); }
           target.classList.add('link-after');
           targetLink = target;

           questionsList.insertBefore(questionsModal, questionsListItem[i+1]);

           questionsModal.classList.add('modal-active');
           item.style.marginBottom = '15px';

           questionsModalText.innerHTML = item.getAttribute('data-questions');
       }


       if (item.classList[1] === 'others') {
           item.classList.add('modal-disable');

           questionsListItem[5].classList.add('modal-active-list');
           questionsListItem[6].classList.add('modal-active-list');

           questionsModal.classList.remove('modal-active');
       }
   })
});

questionsModalClose.addEventListener('click', ()=> {
    questionsModal.classList.remove('modal-active');
    clearListStyle();

    if (targetLink) { targetLink.classList.remove('link-after'); }
});
