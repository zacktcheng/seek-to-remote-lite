(function() {

    /**
     * Variables
     */
    var user_id = '1111';
    var category = 'Software Development';
    var tempFavItems = {};

    var aboutBtn = document.getElementById('about-btn');
    var logoutBtn = document.getElementById('logout-btn');
    var pcNavigator = document.getElementById('pc-navigator');
    var mbExploreBtn = document.getElementById('mobile-explore-btn');
    var mbLotteryBtn = document.getElementById('mobile-lottery-btn');
    var mbFavoriteBtn = document.getElementById('mobile-favorite-btn');
    var mbRecommendBtn = document.getElementById('mobile-recommend-btn');
    var categoryMenu = document.getElementById('category-menu');
    var aboutInfo = document.getElementById('about-info');
    var loginForm = document.getElementById('login-form');
    var registerForm = document.getElementById('register-form');
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
        categoryMenu.addEventListener("change", getCategory);
        document.getElementById('pc-explore-btn').addEventListener('click', loadSearchItems);
        document.getElementById('pc-lottery-btn').addEventListener('click', loadRandomsearchItems);
        document.getElementById('pc-favorite-btn').addEventListener('click', loadFavoriteItems);
        document.getElementById('pc-recommend-btn').addEventListener('click', loadRecommendedItems);
        mbExploreBtn.addEventListener('click', loadSearchItems);
        mbLotteryBtn.addEventListener('click', loadRandomsearchItems);
        mbFavoriteBtn.addEventListener('click', loadFavoriteItems);
        mbRecommendBtn.addEventListener('click', loadRecommendedItems);
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
        let url = './login';
        let req = JSON.stringify({});

        // display loading message
        showLoadingMessage('Validating session...');

        // make AJAX call
        ajax('GET', url, req,
            // session is still valid
            function(res) {
                let result = JSON.parse(res);

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
        toggleButtonsVisibility(true);
        showElement(categoryMenu);
        showElement(itemList);

        loadSearchItems();
    }

    function onSessionInvalid() {
        hideElement(aboutBtn);
        hideElement(logoutBtn);
        toggleButtonsVisibility(false);
        hideElement(categoryMenu);
        hideElement(aboutInfo);
        hideElement(registerForm);
        hideElement(itemList);

        clearLoginError();

        showElement(loginForm, 'flex');
    }

    function showRegisterForm() {
        hideElement(aboutBtn);
        hideElement(logoutBtn);
        toggleButtonsVisibility(false);
        hideElement(categoryMenu);
        hideElement(loginForm);
        hideElement(aboutInfo);
        hideElement(itemList);
        
        clearRegisterResult();

        showElement(registerForm, 'flex');
    }

    function showAboutInfo() {
        let initSec = initSessionAndprocessFavItems('Saving user updates...');
        activeBtn('about-btn', '');

        setTimeout(function() {
            hideElement(loginForm);
            hideElement(registerForm);
            hideElement(itemList);

            showElement(logoutBtn);
            toggleButtonsVisibility(true);
            showElement(categoryMenu); 
            showElement(aboutInfo, 'flex');
        }, 1500 * initSec);
    }
    
    function toggleButtonsVisibility(visible) {
        if(visible) {
           showElement(pcNavigator, 'flex');
           showElement(mbExploreBtn);
           showElement(mbLotteryBtn);
           showElement(mbFavoriteBtn);
           showElement(mbRecommendBtn);
        } 
        else {
           hideElement(pcNavigator);
           hideElement(mbExploreBtn);
           hideElement(mbLotteryBtn);
           hideElement(mbFavoriteBtn);
           hideElement(mbRecommendBtn);
        }
    }

    // -----------------------------------
    // Login
    // -----------------------------------

    function login() {
        clearLoginError();
        showPending('login-form', 'login-pending');
        let username = document.querySelector('#username').value;
        let password = document.querySelector('#password').value;
        password = md5(username + md5(password));

        // The request parameters
        let url = './login';
        let req = JSON.stringify({
            user_id: username,
            password: password,
        });

        ajax('POST', url, req,
            // successful callback
            function(res) {
                let result = JSON.parse(res);

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
        let errorMsg = document.getElementById('login-error');
        errorMsg.innerHTML = 'Invalid username or password.';
        showElement(errorMsg);
    }

    function clearLoginError() {
        let errorMsg = document.getElementById('login-error');
        errorMsg.innerHTML = '';
        hideElement(errorMsg);
    }

    // -----------------------------------
    // Register
    // -----------------------------------

    function register() {
        clearRegisterResult();
        showPending('register-form', 'register-pending');
        
        let username = document.getElementById('register-username').value;
        let password = document.getElementById('register-password').value;
        let firstName = document.getElementById('register-first-name').value;
        let lastName = document.getElementById('register-last-name').value;

        if(username === "" || password === "" || firstName === "" || lastName === "") {
            clearPending('register-pending');
            showRegisterResult('Please fill in all fields.');
            return;
        }
        if(username.match(/^[a-z0-9]+$/i) === null) {
            clearPending('register-pending');
            showRegisterResult('Invalid username.');
            return
        }
        
        password = md5(username + md5(password));

        // The request parameters
        let url = './register';
        let req = JSON.stringify({
            user_id: username,
            password: password,
            first_name: firstName,
            last_name: lastName,
        });

        ajax('POST', url, req,
            // successful callback
            function(res) {
                let result = JSON.parse(res);

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
        let result = document.getElementById('register-result');
        
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
        let result = document.getElementById('register-result');
        result.innerHTML = '';
        hideElement(result);
    }

    // -----------------------------------
    // Logout
    // -----------------------------------

    function logout() {
        let initSec = initSessionAndprocessFavItems('Saving user updates...');
        hideElement(aboutInfo);

        setTimeout(function() {
            // Display loading message.
            showLoadingMessage('Logging out...');

            // The request parameters
            let url = './logout';
            let data = null;

            ajax('GET', url, data,
                // successful callback
                function(res) {
                    let result = JSON.parse(res);
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
        if(element === null) throw 'element is null';
        let displayStyle = style ? style : 'block';
        element.style.display = displayStyle;
    }

    function hideElement(element) {
        if(element === null) throw 'element is null';
        element.style.display = 'none';
    }
    
    function showPending(parentId, childId) {
        let parent = document.getElementById(parentId);
        let child = $create('i', 
        {
          id: childId,
          class: 'fa fa-spinner fa-spin'
        }, '');
        parent.appendChild(child);
    }
    
    function clearPending(childId) {
       let child = document.getElementById(childId);
       child.parentNode.removeChild(child);

    }

    function getCategory() {
        toggleTempFavItemsAtBackEnd();
        let element = document.getElementById("category-menu");
        category = element.options[element.selectedIndex].text;
    }

    function toggleFavItem(item) {
        let key = 'item-' + item.itemId;
        let root = document.getElementById(key);
        let isPreviouslyFavorited = root.getAttribute('data-favorite') === 'true';
        let favIcon = document.getElementById('item-favIcon-' + item.itemId);

        // Invert the values at front-end.
        root.dataset.favorite = !isPreviouslyFavorited;
        favIcon.className = isPreviouslyFavorited ? 'fa fa-star-o' : 'fa fa-star';

        // Store { key : [item, true/false] } in tempFavItems for back-end.  
        if (tempFavItems.hasOwnProperty(key)) {
            delete tempFavItems[key];
        }
        else {
            tempFavItems[key] = [item, isPreviouslyFavorited];
        }
    }

    function initSessionAndprocessFavItems(msg) {
        // Initiate a session with empty background.
        document.getElementById('item-list').innerHTML = '';

        // Process remaining items then reset array empty. 
        let itemsNum = toggleTempFavItemsAtBackEnd();

        // Print out loading message to notify the end user when itemsNum > 0.
        if (itemsNum > 0 && typeof msg === 'string') {
            showLoadingMessage(msg);
        }
        return itemsNum; // Will be passed as initSec to let ajax function await.
    }

    function activeBtn(pcBtnId, mbBtnId) {
        let buttons = document.getElementsByClassName('buttons');
        console.log('inside activeBtn, button length: ' + buttons.length);
        console.log(pcBtnId + ', ' + mbBtnId);
        for (let i = 0; i < buttons.length; i++) {

            if (buttons[i].id !== 'category-menu') {
                console.log(buttons[i].id);
                if (buttons[i].id === pcBtnId || buttons[i].id === mbBtnId) {
                console.log('id: ' + buttons[i].id);
                    buttons[i].className = 'buttons active';
                }
                else {
                    buttons[i].className = 'buttons';
                }
            }
        }
    }

    function showLoadingMessage(msg) {
        let itemList = document.getElementById('item-list');
        itemList.innerHTML = '<p class="notice"><i class="fa fa-spinner fa-spin"></i> ' +
            msg + '</p>';
    }

    function showWarningMessage(msg) {
        let itemList = document.getElementById('item-list');
        itemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i> ' +
            msg + '</p>';
    }

    function showErrorMessage(msg) {
        let itemList = document.getElementById('item-list');
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
        let element = document.createElement(tag);
        for(let key in options) { element.setAttribute(key, options[key]); }
        if(innerHtml) { element.innerHTML = innerHtml; }
        return element;
    }

    /**
     * AJAX helper
     *
     * @param method - GET|POST|PUT|DELETE
     * @param url - API end point
     * @param data - request payload data
     * @param successCallback - Successful callback function
     * @param errorCallback - Error callback function
     */
    function ajax(method, url, data, successCallback, errorCallback) {
        let xhr = new XMLHttpRequest();

        xhr.open(method, url, true);

        xhr.onload = function() {
            if (xhr.status === 200) {
                successCallback(xhr.responseText);
            }
            else { errorCallback(); }
        };

        xhr.onerror = function() {
            console.error("The request couldn't be completed.");
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
        let initSec = initSessionAndprocessFavItems('Saving user updates...');
        hideElement(aboutInfo);
        showElement(itemList);
        console.log('inside load items.');
        activeBtn('pc-explore-btn', 'mobile-explore-btn');

        setTimeout(function() {
            // Display loading message.
            showLoadingMessage('Loading current openings...');

            // The request parameters
            let url = './search';
            let params = 'user_id=' + user_id + '&category=' + category;
            let data = null;

            // make AJAX call
            ajax('GET', url + '?' + params, data,
                // successful callback
                function(res) {
                    let items = JSON.parse(res);

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
        let initSec = initSessionAndprocessFavItems('Saving user updates...');
        hideElement(aboutInfo);
        showElement(itemList);
        activeBtn('pc-lottery-btn', 'mobile-lottery-btn');

        setTimeout(function() {
            // Display loading message.
            showLoadingMessage('Loading random openings...');

            // The request parameters
            let url = './randomsearch';
            let params = 'user_id=' + user_id + '&category=' + category;
            let data = null;

            // make AJAX call
            ajax('GET', url + '?' + params, data,
                // successful callback
                function(res) {
                    let items = JSON.parse(res);

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
        let initSec = initSessionAndprocessFavItems('Saving user updates...');
        hideElement(aboutInfo);
        showElement(itemList);
        activeBtn('pc-favorite-btn', 'mobile-favorite-btn');

        setTimeout(function() {
            // Display loading message.
            showLoadingMessage('Loading favorite job posts...');

            // request parameters
            let url = './history';
            let params = 'user_id=' + user_id;
            let req = JSON.stringify({});

            // make AJAX call
            ajax('GET', url + '?' + params, req, 
                function(res) {
                    let items = JSON.parse(res);

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
        let initSec = initSessionAndprocessFavItems('Saving user updates...');
        hideElement(aboutInfo);
        showElement(itemList);
        activeBtn('pc-recommend-btn', 'mobile-recommend-btn');

        setTimeout(function() {
            // Display loading message.
            showLoadingMessage('Loading recommended jobs...');

            // request parameters
            let url = './recommendation' + '?' + 'user_id=' + user_id + '&category=' + category;
            let data = null;

            // make AJAX call
            ajax('GET', url, data,
                // successful callback
                function(res) {
                    let items = JSON.parse(res);

                    if (!items || items.length === 0) {
                        showWarningMessage('No recommended jobs. Make sure you have favorites.');
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
     * API end point: [POST]/[DELETE] /history request json data: {
     * user_id: 1111, favorite: item }
     */
    function toggleTempFavItemsAtBackEnd() {
        if (Object.keys(tempFavItems).length === 0) return 0;

        console.log('Toggle favorite items from the previous session...');
        let itemCount = Object.keys(tempFavItems).length;

        for (let key in tempFavItems) {
            // request parameters
            let url = './history';
            let req = JSON.stringify({
                user_id: user_id,
                favorite: tempFavItems[key][0]
            });
            let method = tempFavItems[key][1] ? 'DELETE' : 'POST';

            ajax(method, url, req,
                // successful callback
                function(res) {
                    let result = JSON.parse(res);

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
        let itemList = document.getElementById('item-list');
        itemList.innerHTML = ''; // clear current results
        for (let i = 0; i < items.length; i++) { addItem(itemList, items[i]); }
    }

    /**
     * Add a single item to the list
     *
     * @param itemList - The <ul id="item-list"> tag (DOM container)
     * @param item - The item data (JSON object)
     *
     *Example:
     *
     <li class="item" id="item-666617" data-favorite="true">
      <ul>
        <li class="item-job">
          <input type="checkbox" id="666617">
          <label for="666617" class="item-label">
           <img src="https://logo.clearbit.com/panther.co">
           <span id="item-title">Backend Engineer (Node.js + Typescript)</span>
           <span id="item-companyName">Panther</span>
          </label>
          <ul>
           <li>This is the job description.</li>
          </ul>
        </li>
        <li class="item-url">
          <a href="#" target="_blank"><i class="material-icons">open_in_new</i></a>
        </li>
        <li class="item-fav">
          <i id="item-favIcon-666617" class="material-icons">star</i>
        </li>
      </ul>
     </li>
     */
    function addItem(itemList, item) {
        // Immediately return if any of below attributes is invalid.
        if (typeof item.itemId === 'undefined' || !item.itemId
            || typeof item.title === 'undefined' || !item.title
            || typeof item.companyName === 'undefined' || !item.companyName
            || typeof item.url === 'undefined' || !item.url) {
            return;
        }

        // Optional attributes.
        let item_companyLogoUrl = './src/no-image-icon-23485.jpg';
        let item_description = 'For more info of this job post, please click on the url link by the star button.'

        if (typeof item.companyLogoUrl !== 'undefined' && item.companyLogoUrl) {
            item_companyLogoUrl = item.companyLogoUrl;
        }

        if (typeof item.description !== 'undefined' && item.description) {
            item_description = item.description.replace(/\. \-/g, '.<br> -');
        }

        // Check if item contains 'favorite' key. Each recommended item doesn't contain 'favorite' key.
        let hasFavorite = Object.prototype.hasOwnProperty.call(item, 'favorite');

        /*
        * Construct the list item from bottom-up.
        */

        // Create logo element <img>.
        let logo = $create('img', { src: item_companyLogoUrl }, '');
        // Create title element <span>.
        let title = $create('span', { class: 'item-title' }, item.title);
        // Create companyName element <span>.
        let companyName = $create('span', { class: 'item-companyName' }, item.companyName);
        // Create id element <input>.
        let id = $create('input', { type: 'checkbox', id: item.itemId }, '');
        // Create label element <label> to host logo, title and companyName.
        let label = $create('label', { for: item.itemId, class: 'item-label' }, '');
        label.appendChild(logo);
        label.appendChild(title);
        label.appendChild(companyName);
        // Create description element <li>.
        let description = $create('li', {}, item_description);
        // Create desList element <ul> to host description.
        let desList = $create('ul', {}, '');
        desList.appendChild(description);
        // Create job element <li> to host id, label and desList.
        let job = $create('li', { class: 'item-job' }, '');
        job.appendChild(id);
        job.appendChild(label);
        job.appendChild(desList);

        // Create linkIcon element <i>.
        let linkIcon = $create('i', { class: 'fa fa-external-link' }, '');
        // Create link element <a> to host linkIcon.
        let link = $create('a', { href: item.url, target: '_blank' }, '');
        link.appendChild(linkIcon);
        // Create url element <li> to host link.
        let url = $create('li', { class: 'item-url' }, '');
        url.appendChild(link);

        // Create favIcon element <i>.
        let favIconClassName = 'fa fa-star-o';
        if(hasFavorite && item.favorite) { favIconClassName = 'fa fa-star' };
        let favIcon = $create('i', {
            id: 'item-favIcon-' + item.itemId,
            class: favIconClassName
        }, '');
        favIcon.onclick = function() { toggleFavItem(item); };
        // Create fav element <li> to host favIcon.
        let fav = $create('li', { class: 'item-fav' }, '');
        fav.appendChild(favIcon);

        // Create uList element <ul> to host job and url and fav.
        let uList = $create('ul', {}, '');
        uList.appendChild(job);
        uList.appendChild(url);
        uList.appendChild(fav);

        // Create root element <li> to host uList.
        let root = $create('li', { id: 'item-' + item.itemId, class: 'item' }, '');
        if (hasFavorite) {
            root.dataset.favorite = item.favorite;
        } else {
            root.dataset.favorite = false;
        }
        root.appendChild(uList);

        // Append root to itemList.
        itemList.appendChild(root);
    }

    init();

})();