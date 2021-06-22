(function() {

  /**
   * Variables
   */
  var user_id = '1111';
  var user_name = 'John';
  var category = 'Software Development'; 
  
  var logoutBtn = document.getElementById('logout-btn');
  var categoryMenu = document.getElementById('category-menu');
  var exploreBtn = document.getElementById('explore-btn');
  var lotteryBtn = document.getElementById('lottery-btn');
  var favoriteBtn = document.getElementById('favorite-btn');
  var recommendBtn = document.getElementById('recommend-btn');
  var welcomeMsg = document.getElementById('welcome-msg');
  var contactInfo = document.getElementById('contact-info');
  var aboutInfo = document.getElementById('about-info');
  var loginForm = document.getElementById('login-form');
  var registerForm = document.getElementById('register-form');
  var itemList = document.getElementById('item-list');

  /**
   * Initialize major event handlers
   */
  function init() {
    // register event listeners
    document.getElementById('login-form-btn').addEventListener('click', onSessionInvalid);
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('register-form-btn').addEventListener('click', showRegisterForm);
    document.getElementById('register-btn').addEventListener('click', register);
    document.getElementById('category-menu').addEventListener("change", getCategory);
    document.getElementById('explore-btn').addEventListener('click', loadSearchItems);
    document.getElementById('lottery-btn').addEventListener('click', loadRandomsearchItems);
    document.getElementById('favorite-btn').addEventListener('click', loadFavoriteItems);
    document.getElementById('recommend-btn').addEventListener('click', loadRecommendedItems);
    document.getElementById('contact-btn').addEventListener('click', showContactInfo);
    document.getElementById('about-btn').addEventListener('click', showAboutInfo);
    document.getElementById('logout-btn').addEventListener('click', onSessionInvalid);

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

        if(result.status === 'OK') {
          onSessionValid(result);
        }
      }, function(){
          console.log('login error')
    });
  }

  function onSessionValid(result) {
    user_id = result.user_id;
    
    hideElement(contactInfo);
    hideElement(aboutInfo);
    hideElement(welcomeMsg);
    hideElement(loginForm);
    hideElement(registerForm);
    
    showElement(logoutBtn);
    showElement(categoryMenu);
    showElement(exploreBtn);
    showElement(lotteryBtn);
    showElement(favoriteBtn);
    showElement(recommendBtn);
    showElement(itemList);
    
    loadSearchItems();
  }

  function onSessionInvalid() {
    hideElement(logoutBtn);
    hideElement(categoryMenu);
    hideElement(exploreBtn);
    hideElement(lotteryBtn);
    hideElement(favoriteBtn);
    hideElement(recommendBtn);
    hideElement(contactInfo);
    hideElement(aboutInfo);
    hideElement(registerForm);
    hideElement(itemList);
    
    clearLoginError();
    
    showElement(welcomeMsg);
    showElement(loginForm);
  }
  
  function showRegisterForm() {
    hideElement(logoutBtn);
    hideElement(categoryMenu);
    hideElement(exploreBtn);
    hideElement(lotteryBtn);
    hideElement(favoriteBtn);
    hideElement(recommendBtn);
    hideElement(contactInfo);
    hideElement(loginForm);
    hideElement(aboutInfo);
    hideElement(itemList);
    
    clearRegisterResult();
    
    showElement(welcomeMsg);
    showElement(registerForm);
  }
  
  function showContactInfo() {
    hideElement(categoryMenu);
    hideElement(exploreBtn);
    hideElement(lotteryBtn);
    hideElement(favoriteBtn);
    hideElement(recommendBtn);
    hideElement(aboutInfo);
    hideElement(welcomeMsg);
    hideElement(loginForm);
    hideElement(registerForm);
    hideElement(itemList);
    
    showElement(logoutBtn);
    showElement(contactInfo);
  }
  
  function showAboutInfo() {
    hideElement(categoryMenu);
    hideElement(exploreBtn);
    hideElement(lotteryBtn);
    hideElement(favoriteBtn);
    hideElement(recommendBtn);
    hideElement(aboutInfo);
    hideElement(welcomeMsg);
    hideElement(loginForm);
    hideElement(registerForm);
    hideElement(itemList);
    
    showElement(logoutBtn);
    showElement(contactInfo);
  }
  
  // -----------------------------------
  // Login
  // -----------------------------------

  function login() {
    var username = document.querySelector('#username').value;
    var password = document.querySelector('#password').value;
    password = md5(username + md5(password));

    // The request parameters
    var url = './login';
    var req = JSON.stringify({
      user_id : username,
      password : password,
    });

    ajax('POST', url, req,
      // successful callback
      function(res) {
        var result = JSON.parse(res);

        // successfully logged in
        if(result.status === 'OK') {
          onSessionValid(result);
        }
      },

      // error
      function() {
        showLoginError();
      });
  }

  function showLoginError() {
    document.querySelector('#login-error').innerHTML = 'Invalid username or password.';
  }

  function clearLoginError() {
    document.querySelector('#login-error').innerHTML = '';
  }
  
  // -----------------------------------
  // Register
  // -----------------------------------

  function register() {
    var username = document.querySelector('#register-username').value;
    var password = document.querySelector('#register-password').value;
    var firstName = document.querySelector('#register-first-name').value;
    var lastName = document.querySelector('#register-last-name').value;
    
    if(username === "" || password == "" || firstName === "" || lastName === "") {
    	showRegisterResult('Please fill in all fields.');
    	return
    }
    
    if(username.match(/^[a-z0-9_]+$/) === null) {
    	showRegisterResult('Invalid username.');
    	return
    }
    
    password = md5(username + md5(password));

    // The request parameters
    var url = './register';
    var req = JSON.stringify({
      user_id : username,
      password : password,
      first_name: firstName,
      last_name: lastName,
    });

    ajax('POST', url, req,
      // successful callback
      function(res) {
        var result = JSON.parse(res);

        // successfully logged in
        if(result.status === 'OK') {
        	showRegisterResult('Succesfully registered!');
        } 
        else {
        	showRegisterResult('User already existed!');
        }
      },

      // error
      function() {
    	  showRegisterResult('Failed to register.');
      });
  }

  function showRegisterResult(registerMessage) {
    document.querySelector('#register-result').innerHTML = registerMessage;
  }

  function clearRegisterResult() {
    document.querySelector('#register-result').innerHTML = '';
  }
  
  // -----------------------------------
  // Helper Functions
  // -----------------------------------

  function showElement(element, style) {
    if(element === null) throw 'element is null';
    var displayStyle = style ? style : 'block';
    element.style.display = displayStyle;
  }
  
  function hideElement(element) {
    if(element === null) throw 'element is null';
    element.style.display = 'none';
  }
  
  function getCategory() {
    var element = document.getElementById("category-menu");
    category = element.options[element.selectedIndex].text;
    console.log(category);
  }
  
  /**
   * A helper function activates nav-btn class of child element of input element
   *
   * @param btnId - The id of the input element
   */
  function activeBtn(parentId) {
    var panelChildren = document.getElementsByClassName('panel').childNodes;
    
    for(var i = 0; i < panelChildren.length; i++) {
      
      if(panelChildren[i].id !== null && panelChildren[i].id !== 'category-menu') {
        var button = panelChildren[i];
        
        if(button.childElementCount > 0 && button[0].nodeName === 'A') {
          var link = button[0];
          
          if(button.id === parentId) {
            if(link.className === 'nav-btn') {
              link.className += ' active';
            } 
          }
          else if(link.className === 'nav-btn active') {
            link.className = link.className.replace(/\bactive\b/, '');
          }
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
    for(var key in options) {
      if(options.hasOwnProperty(key)) {
        element[key] = options[key];
      }
    }
    element.innerHTML = innerHtml;
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
    var xhr = new XMLHttpRequest();

    xhr.open(method, url, true);

    xhr.onload = function() {
      if(xhr.status === 200) {
        successCallback(xhr.responseText);
      } 
      else {
        errorCallback();
      }
    };

    xhr.onerror = function() {
      console.error("The request couldn't be completed.");
      errorCallback();
    };

    if(data === null) {
      xhr.send();
    } 
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
    console.log('loadSearchItems');
    activeBtn('explore-btn');

    // The request parameters
    var url = './search';
    var params = 'user_id=' + user_id + 'category=' + category;
    var data = null;

    // display loading message
    showLoadingMessage('Loading current openings...');

    // make AJAX call
    ajax('GET', url + '?' + params, data,
      // successful callback
      function(res) {
        var items = JSON.parse(res);
        if(!items || items.length === 0) {
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
  }
  
  /**
   * API #2 Load the random items API end point: [GET]
   * /randomsearch?user_id=1111&category=Software Development
   */
  function loadRandomsearchItems() {
    console.log('loadRandomsearchItems');
    activeBtn('lottery-btn');
    
    // The request parameters
    var url = './randomsearch';
    var params = 'user_id=' + user_id + 'category=' + category;
    var data = null;
    
    // display loading message
    showLoadingMessage('Loading random openings...');
    
    // make AJAX call
    ajax('GET', url + '?' + params, data,
      // successful callback
      function(res) {
        var items = JSON.parse(res);
        if(!items || items.length === 0) {
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
  }

  /**
   * API #3 Load favorite (or visited) items API end point: [GET]
   * /history?user_id=1111
   */
  function loadFavoriteItems() {
    activeBtn('favorite-btn');

    // request parameters
    var url = './history';
    var params = 'user_id=' + user_id;
    var req = JSON.stringify({});

    // display loading message
    showLoadingMessage('Loading favorite job posts...');

    // make AJAX call
    ajax('GET', url + '?' + params, req, function(res) {
      var items = JSON.parse(res);
      if(!items || items.length === 0) {
        showWarningMessage('No favorite job post.');
      } 
      else {
        listItems(items);
      }
    }, function() {
      showErrorMessage('Cannot load favorite job posts.');
    });
  }

  /**
   * API #4 Load recommended items API end point: [GET]
   * /recommendation?user_id=1111
   */
  function loadRecommendedItems() {
    activeBtn('recommend-btn');

    // request parameters
    var url = './recommendation' + '?' + 'user_id=' + user_id + '&category=' + category;
    var data = null;

    // display loading message
    showLoadingMessage('Loading recommended jobs...');

    // make AJAX call
    ajax('GET', url, data,
      // successful callback
      function(res) {
        var items = JSON.parse(res);
        if(!items || items.length === 0) {
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
  }

  /**
   * API #5 Toggle favorite (or visited) items
   *
   * @param item - The item from the list
   *
   * API end point: [POST]/[DELETE] /history request json data: {
   * user_id: 1111, favorite: item }
   */
  function toggleFavoriteItem(item) {
    // check whether this item has been visited or not
    var root = document.getElementById(item.item_id);
    var favIcon = document.getElementById('item-favIcon-' + item.item_id);
    var isPreviouslyFavorited = root.dataset.favorite === 'true';
    // request parameters
    var url = './history';
    var req = JSON.stringify({
      user_id: user_id,
      favorite: item
    });
    var method = isPreviouslyFavorited ? 'DELETE' : 'POST';

    ajax(method, url, req,
      // successful callback
      function(res) {
        var result = JSON.parse(res);
        if (result.status === 'OK' || result.result === 'SUCCESS') {
          // Reverse the values after the database is edited successfully.
          root.dataset.favorite = !isPreviouslyFavorited;
          favIcon.innerHTML = isPreviouslyFavorited ? 'star-border' : 'star';
        }
      });
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
    var itemList = document.getElementsByClassName('item-list');
    itemList.innerHTML = ''; // clear current results

    for(var i = 0; i < items.length; i++) {
      addItem(itemList, items[i]);
    }
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
         <span>
           <h5>Backend Engineer (Node.js + Typescript)</h4>
           <h6>Panther</h5>
         </span>
        </label>
        <ul>
           <li class="description">
             This is the job description.
           </li>
        </ul>
      </li>
      <li class="item-url">
        <a href="#">
          <i class="material-icons">open_in_new</i>
        </a>
      </li>
      <li class="item-fav">
        <i id="item-favIcon-666617" class="material-icons">star-border</i>
      </li>
    </ul>
   </li>
   */
  function addItem(itemList, item) {
    // Immediately return if any of below attributes is invalid.
    if(typeof item.item_id === 'undefined' || !item.item_id 
       || typeof item.title === 'undefined' || !item.title 
       || typeof item.companyName === 'undefined' || !item.companyName 
       || typeof item.url === 'undefined' || !item.url
       || typeof item.favorite === 'undefined' || !item.favorite) { 
      return; 
    }
    
    // Optional attributes.
    var item_companyLogoUrl = 'https://avatars.githubusercontent.com/u/65567443?s=60&v=4';
    if(typeof item.companyLogoUrl !== 'undefined' && item.companyLogoUrl) {
      item_companyLogoUrl = item.companyLogoUrl;
    }
    
    var item_description = 'For more info of this job post, please click on the url link by the star button.'
    if(typeof item.description !== 'undefined' && item.description) {
      item_description = item.description;
    }
    
    /*
    * Construct the list item from bottom-up.
    */
    
    // Create title element <h5>.
    var title = $create('h5', {}, item.title);
    // Create companyName element <h6>.
    var companyName = $create('h6', {}, item.companyName);
    // Create span element <span> to host title and companyName.
    var span = $create('span', {}, '');
    span.appendChild(title);
    span.appendChild(companyName);    
    // Create logo element <img>.
    var logo = $create('img', { src: item_companyLogoUrl }, '');
    // Create id element <input>.
    var id = $create('input', { type: 'checkbox', id: item.item_id }, '');
    // Create label element <label> to host logo and span.
    var label = $create('label', { for: item.item_id, className: 'item-label' }, '');
    label.appendChild(logo);
    label.appendChild(span);
    // Create description element <li>.
    var description = $create('li', { class: 'description' }, item_description);
    // Create desList element <ul> to host description.
    var desList = $create('ul', {}, '');
    desList.appendChild(description);
    // Create job element <li> to host id and label.
    var job = $create('li', { className: 'item-job' }, '');
    job.appendChild(id);
    job.appendChild(label);
    
    // Create linkIcon element <i>.
    var linkIcon = $create('i', { class: 'material-icons' }, 'Open_in_new');
    // Create link element <a> to host linkIcon.
    var link = $create('a', { href: item.url }, '');
    link.appendChild(linkIcon);
    // Create url element <li> to host link.
    var url = $create('li', { className: 'item-url' }, '');
    url.appendChild(link);
    
    // Create favIcon element <i>.
    var favInnerHtml = item.favorite ? 'star' : 'star-border';
    var favIcon = $create('i', { 
      id: 'item-favIcon-' + item.item_id, 
      className: 'material-icons' 
    }, favInnerHtml);
    favIcon.onclick = function() { toggleFavoriteItem(item); };
    // Create fav element <li> to host favIcon.
    var fav = $create('li', { className: 'item-fav' }, '');
    fav.appendChild(starIcon);
    
    // Create uList element <ul> to host job and url and fav.
    var uList = $create('ul', {}, '');
    uList.appendChild(job);
    uList.appendChild(url);
    uList.appendChild(fav);
    
    // Create root element <li> to host uList.
    var root = $create('li', { id: 'item-' + item.item_id }, '');
    root.dataset.favorite = item.favorite;
    root.appendChild(uList);
    
    // Append root to itemList.
    itemList.appendChild(root);
  }
  
  init();

})();

