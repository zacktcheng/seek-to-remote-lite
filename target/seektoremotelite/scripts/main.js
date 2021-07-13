(function() {

    /**
     * Variables
     */
    var user_id = '1111';
    var category = 'Software Development';
    var tempFavItems = {};

    var aboutBtn = document.getElementById('about-btn');
    var logoutBtn = document.getElementById('logout-btn');
    var aboutInfo = document.getElementById('about-info');
    var loginForm = document.getElementById('login-form');
    var registerForm = document.getElementById('register-form');
    var navigator = document.getElementById('navigator');
    var categoryMenu = document.getElementById('category-menu');
    var sessionInfo = document.getElementById('session-info');
    var itemList = document.getElementById('item-list');

    /**
     * Initialize major event handlers
     */
    function init() {
        // register event listeners
        logoutBtn.addEventListener('click', logout);
        document.getElementById('login-form-btn').addEventListener('click', onSessionInvalid);
        document.getElementById('login-btn').addEventListener('click', login);
        document.getElementById('register-form-btn').addEventListener('click', showRegisterForm);
        document.getElementById('register-btn').addEventListener('click', register);
        document.getElementById('menu-btn').addEventListener('click', toggleMenu);
        addEventListenerToCategoryDivs();
        document.getElementById('explore-btn').addEventListener('click', loadSearchItems);
        document.getElementById('lottery-btn').addEventListener('click', loadRandomsearchItems);
        document.getElementById('favorite-btn').addEventListener('click', loadFavoriteItems);
        document.getElementById('recommend-btn').addEventListener('click', loadRecommendedItems);
        aboutBtn.addEventListener('click', showAboutInfo);

        validateSession();
        // onSessionValid({"user_id":"1111","name":"John Smith","status":"OK"});
    }

    /**
     * Session
     */
    function validateSession() {
        onSessionInvalid();
        // The request parameters
        var url = './login';
        var req = JSON.stringify({});

        // display loading message
        showLoadingMessage('Validating session...');

        // make AJAX call
        ajax('GET', url, req,
            // session is still valid
            function(res) {
                var result = JSON.parse(res);

                if (result.status === 'OK') {
                    onSessionValid(result);
                }
            }, 
            function() {
                console.log('login error')
            }
        );
    }

    function onSessionValid(result) {
        user_id = result.user_id;
        hideElement(aboutInfo);
        hideElement(loginForm);
        hideElement(registerForm);

        showElement(aboutBtn);
        showElement(logoutBtn);
        showElement(navigator, 'flex');
        showElement(sessionInfo, 'inline-block');
        showElement(itemList);

        loadSearchItems();
    }

    function onSessionInvalid() {
        hideElement(aboutBtn);
        hideElement(logoutBtn);
        hideElement(navigator);
        hideElement(aboutInfo);
        hideElement(registerForm);
        hideElement(itemList);

        clearLoginError();

        showElement(loginForm, 'flex');
    }

    function showRegisterForm() {
        hideElement(aboutBtn);
        hideElement(logoutBtn);
        hideElement(loginForm);
        hideElement(aboutInfo);
        hideElement(navigator);
        hideElement(itemList);
        
        clearRegisterResult();

        showElement(registerForm, 'flex');
    }

    function showAboutInfo() {
        var initSec = initSessionAndprocessFavItems();
        activeBtn('about-btn');

        setTimeout(function() {
            hideElement(loginForm);
            hideElement(registerForm);
            hideElement(itemList);

            showElement(logoutBtn);
            showElement(navigator, 'flex');
            sessionInfo.textContent = 'About Seek to Remote Lite:';
            showElement(aboutInfo, 'flex');
        }, 1500 * initSec);
    }

    // -----------------------------------
    // Login
    // -----------------------------------

    function login() {
        clearLoginError();
        showPending('login-form', 'login-pending');
        var username = document.querySelector('#username').value;
        var password = document.querySelector('#password').value;
        password = md5(username + md5(password));

        // The request parameters
        var url = './login';
        var req = JSON.stringify({
            user_id: username,
            password: password,
        });

        ajax('POST', url, req,
            // successful callback
            function(res) {
                var result = JSON.parse(res);

                // successfully logged in
                if (result.status === 'OK') {
                    clearPending('login-pending'); 
                    onSessionValid(result); 
                }
            },
            // error
            function() {
                clearPending('login-pending');
                showLoginError();
            }
        );
    }

    function showLoginError() {
        var errorMsg = document.getElementById('login-error');
        errorMsg.innerHTML = 'Invalid username or password.';
        showElement(errorMsg);
    }

    function clearLoginError() {
        var errorMsg = document.getElementById('login-error');
        errorMsg.innerHTML = '';
        hideElement(errorMsg);
    }

    // -----------------------------------
    // Register
    // -----------------------------------

    function register() {
        clearRegisterResult();
        showPending('register-form', 'register-pending');
        
        var username = document.getElementById('register-username').value;
        var password = document.getElementById('register-password').value;
        var firstName = document.getElementById('register-first-name').value;
        var lastName = document.getElementById('register-last-name').value;

        if(username === "" || password === "" || firstName === "" || lastName === "") {
            clearPending('register-pending');
            showRegisterResult('Please fill in all fields.');
            return;
        }
        if(username.match(/^[a-z0-9]+$/i) === null || password.match(/^[a-z0-9]+$/i) === null
        || firstname.match(/^[a-z0-9]+$/i) === null || lastname.match(/^[a-z0-9]+$/i) === null) {
            clearPending('register-pending');
            showRegisterResult('Invalid user input.');
            return
        }
        
        password = md5(username + md5(password));

        // The request parameters
        var url = './register';
        var req = JSON.stringify({
            user_id: username,
            password: password,
            first_name: firstName,
            last_name: lastName,
        });

        ajax('POST', url, req,
            // successful callback
            function(res) {
                var result = JSON.parse(res);

                // successfully logged in
                if (result.status === 'OK') {
                    clearPending('register-pending');
                    showRegisterResult('Registered successfully!');
                }
                else {
                    clearPending('register-pending');
                    showRegisterResult('User\'s already existed!');
                }
            },
            // error
            function() {
                clearPending('register-pending');
                showRegisterResult(false);
            }
        );
    }

    function showRegisterResult(registerMsg) {
        var result = document.getElementById('register-result');
        
        if(registerMsg && registerMsg === 'Registered successfully!') {
            result.style.background = '#0077b5';
            result.innerHTML = registerMsg;
        } else {
            result.style.background = '#f06112';
            result.innerHTML = registerMsg;
        }
        showElement(result);   
    }

    function clearRegisterResult() {
        var result = document.getElementById('register-result');
        result.innerHTML = '';
        hideElement(result);
    }

    // -----------------------------------
    // Logout
    // -----------------------------------

    function logout() {
        var initSec = initSessionAndprocessFavItems();
        document.getElementById('session-info').style.display = 'none';
        hideElement(aboutInfo);

        setTimeout(function() {
            // Display loading message.
            showLoadingMessage('Logging out...');

            // The request parameters
            var url = './logout';
            var data = null;

            ajax('GET', url, data,
                // successful callback
                function(res) {
                    var result = JSON.parse(res);
                    // successfully logged out
                    if (result.status === 'OK') {
                        onSessionInvalid();
                    }
                },
                // error
                function() {
                    showErrorMessage('Failed to logout.');
                }
            );
        }, 1500 * initSec);
    }

    // -----------------------------------
    // Helper Functions
    // -----------------------------------

    function showElement(element, style) {
        if (element === null) throw 'element is null';
        var displayStyle = style ? style : 'block';
        if (element.id === 'about-info') {
            document.getElementsByTagName('MAIN')[0].style.minHeight = 'calc(100vh - 181px)';
        }
        element.style.display = displayStyle;
    }

    function hideElement(element) {
        if (element === null) throw 'element is null';
        if (element.id === 'about-info') {
            document.getElementsByTagName('MAIN')[0].style.minHeight = 'calc(100vh - 151px)';
        }
        element.style.display = 'none';
    }
    
    function showPending(parentId, childId) {
        var parent = document.getElementById(parentId);
        var child = $create('i', 
        {
          id: childId,
          class: 'fa fa-spinner fa-spin'
        }, '');
        parent.appendChild(child);
    }
    
    function clearPending(childId) {
       var child = document.getElementById(childId);
       child.parentNode.removeChild(child);

    }
    
    function toggleMenu(toOpen) {
        if(toOpen) {
            categoryMenu.style.width = '100%';
        } else {
            categoryMenu.style.width = '0';
        }
    }
    
    function addEventListenerToCategoryDivs() {
        var categories = document.getElementById('category-menu').children;
        for(var i = 0; i < categories.length; i++) {
            categories[i].addEventListener('click', getCategoryAndCloseMenu); 
        }
    }

    function getCategoryAndCloseMenu() {  
        toggleTempFavItemsAtBackEnd();
        category = this.textContent;
        toggleMenu(false);
    }

    function toggleFavItem(item) {
        var key = 'item-' + item.itemId;
        var root = document.getElementById(key);
        var isPreviouslyFavorited = root.getAttribute('data-favorite') === 'true';
        var favIcon = document.getElementById('item-favIcon-' + item.itemId);
        var favQuote = document.getElementById('item-favQuote-' + item.itemId);

        // Invert the values at front-end.
        root.dataset.favorite = !isPreviouslyFavorited;
        
        if (isPreviouslyFavorited) {
            favIcon.children[0].className = 'fa fa-star-o';
            favQuote.textContent = 'Save to My Favorites';
        } else {
            favIcon.children[0].className = 'fa fa-star';
            favQuote.textContent = 'Saved';
        }

        // Store { key : [item, true/false] } in tempFavItems for back-end.  
        if (tempFavItems.hasOwnProperty(key)) {
            delete tempFavItems[key];
        }
        else {
            tempFavItems[key] = [item, isPreviouslyFavorited];
        }
    }

    function initSessionAndprocessFavItems() {
        // Close unclosed category menu just in case.
        toggleMenu(false);
    
        // Initiate a session with empty background.
        document.getElementById('item-list').innerHTML = '';

        // Process remaining items then reset array empty. 
        var itemsNum = toggleTempFavItemsAtBackEnd();

        // Print out loading message to notify the end user when itemsNum > 0.
        if (itemsNum > 0) {
            showLoadingMessage('Saving user updates...');
        }
        return itemsNum; // Will be passed as initSec to var ajax function await.
    }

    function activeBtn(btnId) {
        var buttons = document.getElementsByClassName('buttons');
        
        for (var i = 0; i < buttons.length; i++) {

            if (buttons[i].id !== 'menu-btn') {
                if (buttons[i].id === btnId) {
                    buttons[i].className = 'buttons active';
                } else {
                    buttons[i].className = 'buttons';
                }
            }
        }
    }

    function showLoadingMessage(msg) {
        var itemList = document.getElementById('item-list');
        itemList.innerHTML = '<p class="notice"><i class="fa fa-spinner fa-spin"></i> ' +
            msg + '</p>';
    }

    function showWarningMessage(msg) {
        var itemList = document.getElementById('item-list');
        itemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i> ' +
            msg + '</p>';
    }

    function showErrorMessage(msg) {
        var itemList = document.getElementById('item-list');
        itemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-circle"></i> ' +
            msg + '</p>';
    }

    /**
     * A helper function that creates a DOM element <tag options...>
     * @param tag
     * @param options
     * @returns {Element}
     */
    function $create(tag, options, innerHtml) {
        var element = document.createElement(tag);
        for(var key in options) { element.setAttribute(key, options[key]); }
        if (innerHtml) { element.innerHTML = innerHtml; }
        return element;
    }

    /**
     * AJAX helper
     *
     * @param method - GET|POST|PUT|DEvarE
     * @param url - API end point
     * @param data - request payload data
     * @param successCallback - Successful callback function
     * @param errorCallback - Error callback function
     */
    function ajax(method, url, data, successCallback, errorCallback) {
        var xhr = new XMLHttpRequest();

        xhr.open(method, url, true);

        xhr.onload = function() {
            if (xhr.status === 200) {
                successCallback(xhr.responseText);
            }
            else { errorCallback(); }
        };

        xhr.onerror = function() {
            console.error("The request couldn't be compvared.");
            errorCallback();
        };

        if (data === null) { xhr.send(); }
        else {
            xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
            xhr.send(data);
        }
    }

    // -------------------------------------
    // AJAX call server-side APIs
    // -------------------------------------

    /**
     * API #1 Load the items API end point: [GET]
     * /search?user_id=1111&category=Software Development
     */
    function loadSearchItems() {
        var initSec = initSessionAndprocessFavItems('Saving user updates...');
        hideElement(aboutInfo);
        sessionInfo.textContent = category + ' > ' + 'Explore Openings';
        showElement(itemList);
        activeBtn('explore-btn');

        setTimeout(function() {
            // Display loading message.
            showLoadingMessage('Loading current openings...');

            // The request parameters
            var url = './search';
            var params = 'user_id=' + user_id + '&category=' + category;
            var data = null;

            // make AJAX call
            ajax('GET', url + '?' + params, data,
                // successful callback
                function(res) {
                    var items = JSON.parse(res);

                    if (!items || items.length === 0) {
                        showWarningMessage('No available openings.');
                    }
                    else {
                        listItems(items);
                    }
                },
                // failed callback
                function() {
                    showErrorMessage('Cannot load openings.');
                }
            );
        }, 1500 * initSec);
    }

    /**
     * API #2 Load the random items API end point: [GET]
     * /randomsearch?user_id=1111&category=Software Development
     */
    function loadRandomsearchItems() {
        var initSec = initSessionAndprocessFavItems();
        hideElement(aboutInfo);
        sessionInfo.textContent = category + ' > ' + 'I\'m Feeling Lucky';
        showElement(itemList);
        activeBtn('lottery-btn');

        setTimeout(function() {
            // Display loading message.
            showLoadingMessage('Loading random openings...');

            // The request parameters
            var url = './randomsearch';
            var params = 'user_id=' + user_id + '&category=' + category;
            var data = null;

            // make AJAX call
            ajax('GET', url + '?' + params, data,
                // successful callback
                function(res) {
                    var items = JSON.parse(res);

                    if (!items || items.length === 0) {
                        showWarningMessage('No available random openings.');
                    }
                    else {
                        listItems(items);
                    }
                },
                // failed callback
                function() {
                    showErrorMessage('Cannot load random openings.');
                }
            );
        }, 1500 * initSec);
    }

    /**
     * API #3 Load favorite (or visited) items API end point: [GET]
     * /history?user_id=1111
     */
    function loadFavoriteItems() {
        var initSec = initSessionAndprocessFavItems();
        hideElement(aboutInfo);
        sessionInfo.textContent = 'My Favorites';
        showElement(itemList);
        activeBtn('favorite-btn');

        setTimeout(function() {
            // Display loading message.
            showLoadingMessage('Loading favorite job posts...');

            // request parameters
            var url = './history';
            var params = 'user_id=' + user_id;
            var req = JSON.stringify({});

            // make AJAX call
            ajax('GET', url + '?' + params, req, 
                function(res) {
                    var items = JSON.parse(res);

                    if (!items || items.length === 0) {
                        showWarningMessage('No favorite job post.');
                    }
                    else {
                        listItems(items);
                    }
                },
                function() {
                    showErrorMessage('Cannot load favorite job posts.');
                }
            );
        }, 1500 * initSec);
    }

    /**
     * API #4 Load recommended items API end point: [GET]
     * /recommendation?user_id=1111
     */
    function loadRecommendedItems() {
        var initSec = initSessionAndprocessFavItems();
        hideElement(aboutInfo);
        document.getElementById('session-info').innerHTML = category + ' > ' + 'Recommendation';
        showElement(itemList);
        activeBtn('recommend-btn');

        setTimeout(function() {
            // Display loading message.
            showLoadingMessage('Loading recommended jobs...');

            // request parameters
            var url = './recommendation' + '?' + 'user_id=' + user_id + '&category=' + category;
            var data = null;

            // make AJAX call
            ajax('GET', url, data,
                // successful callback
                function(res) {
                    var items = JSON.parse(res);

                    if (!items || items.length === 0) {
                        showWarningMessage('No recommended jobs. Please assure you\'ve enough favorites of the category.');
                    }
                    else {
                        listItems(items);
                    }
                },
                // failed callback
                function() {
                    showErrorMessage('Cannot load recommended jobs.');
                }
            );
        }, 1500 * initSec);
    }

    /**
     * API #5 Toggle favorite (or visited) items at Back-end.
     *        Return tempFavItems length.
     *        Reset tempFavItems with new empty object array.
     *
     * @param item - The item from the list
     *
     * API end point: [POST]/[DEvarE] /history request json data: {
     * user_id: 1111, favorite: item }
     */
    function toggleTempFavItemsAtBackEnd() {
        if (Object.keys(tempFavItems).length === 0) return 0;

        var itemCount = Object.keys(tempFavItems).length;

        for (var key in tempFavItems) {
            // request parameters
            var url = './history';
            var req = JSON.stringify({
                user_id: user_id,
                favorite: tempFavItems[key][0]
            });
            var method = tempFavItems[key][1] ? 'DELETE' : 'POST';

            ajax(method, url, req,
                // successful callback
                function(res) {
                    var result = JSON.parse(res);

                    if (result.status === 'OK' || result.result === 'SUCCESS') {
                        console.log(key + ' result.status: ' + result.status + ' result.result: ' + result.result);
                    }
                }
            );
        }
        tempFavItems = {};
        console.log('tempFavItems length: ' + Object.keys(tempFavItems).length);
        return itemCount;
    }

    // -------------------------------------
    // Create item list
    // -------------------------------------

    /**
     * List recommendation items base on the data received
     *
     * @param items - An array of item JSON objects
     */
    function listItems(items) {
        var itemList = document.getElementById('item-list');
        itemList.innerHTML = ''; // clear current results
        for (var i = 0; i < items.length; i++) { addItem(itemList, items[i]); }
    }

    /**
     * Add a single item to the list
     *
     * @param itemList - The <ul id="item-list"> tag (DOM container)
     * @param item - The item data (JSON object)
     *
     *Example:
     *
     <li class="item" id="item-717564" data-favorite="false">
        <section class="item-header">
          <img src="https://logo.clearbit.com/breeze.pm">
          <div class="item-com-title">
            <span class="item-title">Senior Software Engineer  - Full Stack</span>
            <span>Breeze, LLC</span>
          </div>
          <div class="item-date-cat">
            <div>
              <i class="fa fa-calendar"></i>
              <span>2021-07-09</span>
            </div>
            <div>
              <i class="fa fa-briefcase"></i>
              <span>Software Development</span>
            </div>
          </div>   
        </section>
        <section class="item-details">
          <div>
            <i class="fa fa-clock-o"></i>
            <span>Full_Time</span>
          </div>
          <div>
            <i class="fa fa-map-marker"></i>
            <span>Michigan</span>
          </div>
          <div>
            <i class="fa fa-usd"></i>
            <span>120k/year</span>
          </div>
        </section>  
        <section class="item-nav">
          <div class="fav-openTab">
            <div id="item-favIcon-717564" class="item-buttons">
              <i class="fa fa-star"></i>
              <span id="item-favQuote-717564">Save to My Favorites</span>
            </div>
            <a class="item-buttons" href="#" target="_blank">
              <i class="fa fa-external-link"></i>
              <span>Open in New Tab / Apply Now!</span>
            </a>
          </div>
          <input id="717564" type="checkbox">
          <label class="item-label" for="717564">
            <i class="fa fa-list-ul"></i>
            <span>Job Description</span>
            <i class="fa fa-arrow-down"></i>
          </label>
          <p>- 5+ years of experience working with PHP or Node.js.<br> 
          - 2+ years of experience with any JavaScript frameworks (and openness to explore full-stack engineering).<br>
          </p>
        </section>
      </li>
     */
    function addItem(itemList, item) {
        // Immediately return if any of below attributes is invalid.
        if (typeof item.itemId === 'undefined' || !item.itemId
            || typeof item.title === 'undefined' || !item.title
            || typeof item.companyName === 'undefined' || !item.companyName
            || typeof item.category === 'undefined' || !item.category
            || typeof item.url === 'undefined' || !item.url) {
            console.log('WARNING: At least 1 of the essential item key is missing.');
            return;
        }

        // Optional attributes.
        var item_companyLogoUrl = item.companyLogoUrl ? item.companyLogoUrl : './src/no-image-icon-23485.jpg';
        var item_jobType = item.jobType ? item.jobType : 'TBD';
        var item_date = item.date ? item.date.substring(0, item.date.indexOf('T')) : new Date().toJSON().slice(0,10).replace(/-/g,'-');
        var item_location = item.location ? item.location : 'Unspecified';
        var item_salary = item.salary ? item.salary : 'Undisclosed';
        var item_description = item.description ? item.description.replace(/\- /g, '&#9679; ').replace(/\. /g, '.<br>') : 'For more info of this job post, please click on the url link next to the star button.'

        // Check if item contains 'favorite' key. Each recommended item doesn't contain 'favorite' key.
        var hasFavorite = Object.prototype.hasOwnProperty.call(item, 'favorite');

        /*
        * Construct the list item.
        */
        var comTitle = $create('div', { class: 'item-com-title' });
        comTitle.appendChild($create('span', { class: 'item-title' }, item.title));
        comTitle.appendChild($create('span', {}, item.companyName));
        
        var date = $create('div'); 
        date.appendChild($create('i', { class: 'fa fa-calendar' }));
        date.appendChild($create('span', {}, item_date));
        
        var category = $create('div');
        category.appendChild($create('i', { class: 'fa fa-briefcase' }));
        category.appendChild($create('span', {}, item.category));
        
        var dateCat = $create('div', { class: 'item-date-cat' });
        dateCat.appendChild(date);
        dateCat.appendChild(category);
        
        var header = $create('section', { class: 'item-header' });
        header.appendChild($create('img', { src: item_companyLogoUrl }));
        header.appendChild(comTitle);
        header.appendChild(dateCat);
        
        var jobType = $create('div');
        jobType.appendChild($create('i', { class: 'fa fa-clock-o' }));
        jobType.appendChild($create('span', {}, item_jobType));
        
        var location = $create('div');
        location.appendChild($create('i', { class: 'fa fa-map-marker' }));
        location.appendChild($create('span', {}, item_location));
        
        var salary = $create('div');
        salary.appendChild($create('i', { class: 'fa fa-usd' }));
        salary.appendChild($create('span', {}, item_salary));
        
        var details = $create('section', { class: 'item-details' });
        details.appendChild(jobType);
        details.appendChild(location);
        details.appendChild(salary);
        
        var favIconClassName = 'fa fa-star-o';
        var favQuoteText = 'Save to My Favorites';
        if(hasFavorite && item.favorite) { 
            favIconClassName = 'fa fa-star'
            favQuoteText = 'Already Saved';
        }
        var favIcon = $create('i', { class: favIconClassName });
        var favQuote = $create('span', { id: 'item-favQuote-' + item.itemId }, favQuoteText);
        favQuote.onclick = function() { toggleFavItem(item); };
        var favButton = $create('div', { id: 'item-favIcon-' + item.itemId, class: 'item-buttons' });
        favButton.appendChild(favIcon);
        favButton.appendChild(favQuote);
        
        var link = $create('a', { class: 'item-buttons', href: item.url, target: '_blank' });
        link.appendChild($create('i', { class: 'fa fa-external-link' }));
        link.appendChild($create('span', {}, 'Open in New Tab / Apply Now!'));
        
        var favOpenTab = $create('div', { class: 'fav-openTab' });
        favOpenTab.appendChild(favButton);
        favOpenTab.appendChild(link);
        
        var label = $create('label', { class: 'item-label', for: item.itemId });
        label.appendChild($create('i', { class: 'fa fa-list-ul' }));
        label.appendChild($create('span', {}, 'Job Description'));
        label.appendChild($create('i', { class: 'fa fa-arrow-down' }));
        
        var navigator = $create('section', { class: 'item-nav' });
        navigator.appendChild(favOpenTab);
        navigator.appendChild($create('input', { id: item.itemId, type: 'checkbox' }));
        navigator.appendChild(label);
        navigator.appendChild($create('p', {}, item_description));

        var currentItem = $create('li', { id: 'item-' + item.itemId, class: 'item' });
        currentItem.appendChild(header);
        currentItem.appendChild(details);
        currentItem.appendChild(navigator);
        if (hasFavorite) {
            currentItem.dataset.favorite = item.favorite;
        } else {
            currentItem.dataset.favorite = false;
        }
        itemList.appendChild(currentItem);
    }

    init();

})();