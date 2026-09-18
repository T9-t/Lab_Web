$(document).ready(function() {
    
    $('.dropdown > a').on('click', function(e) {
        e.preventDefault();
    
        const $submenu = $(this).siblings('.submenu');

        $('.submenu').not($submenu).stop(true, true).slideUp(200);
        $submenu.stop(true, true).slideToggle(200);
    });


    $(window).on('scroll', function() {
        const scrollPos = $(document).scrollTop() + 100;
        const windowHeight = $(window).height();
        const docHeight = $(document).height();

        if ($(window).scrollTop() + windowHeight >= docHeight - 10) {

            $('.submenu a').removeClass('active');
            $('.submenu a[href="#contacts"]').addClass('active');
            return;
        }
        $('.submenu a').each(function() {
            const currLink = $(this);
            const href = currLink.attr('href');

            if (!href || href.indexOf('#') !== 0 || href === '#') return;

            const refElement = $(href);
    
            if (refElement.length) {
                if (refElement.offset().top <= scrollPos && refElement.offset().top + refElement.height() > scrollPos) {

                    $('.submenu a').removeClass('active');
                    currLink.addClass('active');
                }
            }
        });
        if ($(document).scrollTop() < 100) {
            
            $('.submenu a').removeClass('active');
            $('.submenu a[href="#"]').addClass('active');
        }
    });


    const $slides = $('.skills-carousel .skill-card');
    const slideCount = $slides.length;
    let currentIndex = 0;
    let isAnimating = false;
    let isUserPaused = false;   

    let autoPlayTimer;       
    let resumeTimer;         
    const PAUSE_TIME = 5000;    

    function showSlide(nextIndex, direction = 'next') {
        if (isAnimating) return; 
    
        let oldIndex = currentIndex;
        let computedNextIndex;
    
        if (nextIndex >= slideCount) {
            computedNextIndex = 0;
        } else if (nextIndex < 0) {
            computedNextIndex = slideCount - 1;
        } else {
            computedNextIndex = nextIndex;
        }

        if (computedNextIndex === oldIndex) return;

        isAnimating = true;
        currentIndex = computedNextIndex;

        const $currentSlide = $slides.eq(oldIndex);
        const $nextSlide = $slides.eq(currentIndex);

        $currentSlide.removeClass('exit-left exit-right prepare-left');
        $nextSlide.removeClass('exit-left exit-right prepare-left');

        if (direction === 'next') {
            $currentSlide.removeClass('active').addClass('exit-left');
            $nextSlide.css('visibility', 'visible');

            $nextSlide[0].offsetHeight; 
            $nextSlide.addClass('active');

        } else {
            $nextSlide.addClass('prepare-left').css('visibility', 'visible');
            $nextSlide[0].offsetHeight; 
        
            $currentSlide.removeClass('active').addClass('exit-right');
            $nextSlide.removeClass('prepare-left').addClass('active');
        }
        setTimeout(function() {

            $slides.not($nextSlide).removeClass('exit-left exit-right prepare-left active').css('visibility', 'hidden');
            isAnimating = false;
        }, 600); 
    }

    function startAutoPlay() {

        clearInterval(autoPlayTimer); 
        autoPlayTimer = setInterval(function() {

            if (!isUserPaused && !isAnimating) {
                showSlide(currentIndex + 1, 'next');
            }
        }, 4000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayTimer);
        clearTimeout(resumeTimer);
    }

    function handleUserInteraction() {
        isUserPaused = true; 
        stopAutoPlay();       

        resumeTimer = setTimeout(function() {
            isUserPaused = false; 
            startAutoPlay();      
        }, PAUSE_TIME);
    }

    $('.next-btn').on('click', function() {

        if (isAnimating) return; 
        handleUserInteraction(); 
        showSlide(currentIndex + 1, 'next');
    });

    $('.prev-btn').on('click', function() {

        if (isAnimating) return; 
        handleUserInteraction(); 
        showSlide(currentIndex - 1, 'prev');
    });

    $slides.css('visibility', 'hidden');
    $slides.eq(currentIndex).addClass('active').css('visibility', 'visible');
    startAutoPlay();


    $.getJSON('./data/portfolio.json', function(data) {
        const portfolioGrid = $('.portfolio-grid');
        
        data.forEach(function(item) {
            const cardHtml = `
                <div class="portfolio-card" style="display: none;">
                    <img class="portfolio-img" src="${item.img}" alt="${item.title}">
                    <div class="portfolio-info">
                        <h3 class="portfolio-title">${item.title}</h3>
                        <p class="portfolio-desc">${item.desc}</p>
                    </div>
                </div>
            `;
            
            const card = $(cardHtml);
            portfolioGrid.append(card);

            card.fadeIn(500);
        });
    });


    $('.open-modal-btn').on('click', function(e) {
        e.preventDefault(); 
    
        $('.submenu').stop(true, true).slideUp(200); 
    
        $('#myModal').css('display', 'flex');
        $('body').css('overflow', 'hidden');
    });

    $('.close-modal').on('click', function() {

        $('#myModal').css('display', 'none');
        $('body').css('overflow', 'auto');
        $(this)[0].reset();
    });

    $('.modal-form').on('submit', function(e) {
        e.preventDefault();

        const $form = $(this);
        const $submitBtn = $form.find('.submit-btn');
        const $messageBox = $form.find('.form-message');

        const $emailInput = $form.find('input[name="useremail"]');
        const $textInput = $form.find('input[name="message-text"]');

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        $emailInput.removeClass('input-error');
        $textInput.removeClass('input-error');
        $messageBox.hide().removeClass('success-msg error-msg');

        if (!emailPattern.test($emailInput.val())) {

            $emailInput.addClass('input-error').focus();
            $messageBox.addClass('error-msg').text('Введите корректный Email (например: ivan@mail.ru).').fadeIn();
            return;
        }

        if ($textInput.val().trim() === "") {

            $textInput.addClass('input-error').focus();
            $messageBox.addClass('error-msg').text('Пожалуйста, напишите текст сообщения.').fadeIn();
            return;
        }
    
        const formArray = $form.serializeArray();
        const dataObject = {};

        formArray.forEach(function(item) {
            dataObject[item.name] = item.value;
        });

        $submitBtn.prop('disabled', true).text('Отправка...');

        $.ajax({
            url: 'https://jsonplaceholder.typicode.com/posts',
            method: 'POST',
            data: JSON.stringify(dataObject),
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            success: function(response) {

                $messageBox
                    .addClass('success-msg')
                    .text('Спасибо! Ваше сообщение успешно отправлено.')
                    .fadeIn();

                $submitBtn.prop('disabled', false).text('Отправить');
                $form[0].reset();
            
                setTimeout(function() {
                    $('#myModal').css('display', 'none');
                    $('body').css('overflow', 'auto');
                    $messageBox.hide();
                }, 5000);
            },
            error: function(xhr, status, error) {
                
                $messageBox
                    .addClass('error-msg')
                    .text('Произошла ошибка при отправке. Попробуйте позже.')
                    .fadeIn();
            
                $submitBtn.prop('disabled', false).text('Отправить');
            }
        });
    });

    $(document).on('click', function(e) {
        const $target = $(e.target);

        if (!$target.closest('.dropdown').length) {
            $('.submenu').stop(true, true).slideUp(200);
        }
        if ($target.is('#myModal')) {
            $('#myModal').css('display', 'none');
            $('body').css('overflow', 'auto');
        }
    });
});