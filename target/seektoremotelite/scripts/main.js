(function() {

  /**
   * Variables
   */
  var user_id = '1111';
  var user_name = 'John';
  var category = 'Software Development'; 
  var tempFavItems = {};
  
  var contactBtn = document.getElementById('contact-btn');
  var aboutBtn = document.getElementById('about-btn');
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
    document.getElementById('logout-btn').addEventListener('click', logout);
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
    
    showElement(contactBtn);
    showElement(aboutBtn);
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
  	hideElement(contactBtn);
    hideElement(aboutBtn);
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
  	hideElement(contactBtn);
    hideElement(aboutBtn);  
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
  	let times = toggleTempFavItemsAtBackEnd();
  	
  	// Display loading message.
  	if(times > 0) showLoadingMessage('Saving user updates...');
  	
  	setTimeout(function() {
  	  hideElement(aboutInfo);
      hideElement(welcomeMsg);
      hideElement(loginForm);
      hideElement(registerForm);
      hideElement(itemList);
    
      showElement(logoutBtn);
      showElement(categoryMenu);
      showElement(exploreBtn);
      showElement(lotteryBtn);
      showElement(favoriteBtn);
      showElement(recommendBtn);
      showElement(contactInfo);
  	}, 1500 * times);
  }
  
  function showAboutInfo() {
  	let times = toggleTempFavItemsAtBackEnd();
  	
  	// Display loading message.
  	if(times > 0) showLoadingMessage('Saving user updates...');
  	
  	setTimeout(function() {
  	  hideElement(contactInfo);
      hideElement(welcomeMsg);
      hideElement(loginForm);
      hideElement(registerForm);
      hideElement(itemList);
    
      showElement(logoutBtn);
      showElement(categoryMenu);
      showElement(exploreBtn);
      showElement(lotteryBtn);
      showElement(favoriteBtn);
      showElement(recommendBtn);
      showElement(aboutInfo);
  	}, 1500 * times);
  }
  
  // -----------------------------------
  // Login
  // -----------------------------------

  function login() {
    let username = document.querySelector('#username').value;
    let password = document.querySelector('#password').value;
    password = md5(username + md5(password));

    // The request parameters
    let url = './login';
    let req = JSON.stringify({
      user_id : username,
      password : password,
    });

    ajax('POST', url, req,
      // successful callback
      function(res) {
        let result = JSON.parse(res);

        // successfully logged in
        if(result.status === 'OK') { onSessionValid(result); }
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
    let username = document.querySelector('#register-username').value;
    let password = document.querySelector('#register-password').value;
    let firstName = document.querySelector('#register-first-name').value;
    let lastName = document.querySelector('#register-last-name').value;
    
    if(username === "" || password === "" || firstName === "" || lastName === "") {
    	showRegisterResult('Please fill in all fields.');
    	return
    }
    
    if(username.match(/^[a-z0-9_]+$/) === null) {
    	showRegisterResult('Invalid username.');
    	return
    }
    
    password = md5(username + md5(password));

    // The request parameters
    let url = './register';
    let req = JSON.stringify({
      user_id : username,
      password : password,
      first_name: firstName,
      last_name: lastName,
    });

    ajax('POST', url, req,
      // successful callback
      function(res) {
        let result = JSON.parse(res);

        // successfully logged in
        if(result.status === 'OK') {
        	showRegisterResult('Successfully registered!');
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
  // Logout
  // -----------------------------------
  
  function logout() {
  	let times = toggleTempFavItemsAtBackEnd();
  	hideElement(contactInfo);
    hideElement(aboutInfo);
    
    let itemList = document.getElementById('item-list');
    itemList.innerHTML = ''; // clear current results
    showElement(itemList);
    
    // Display loading message.
  	if(times > 0) showLoadingMessage('Saving user updates...');
  	
  	setTimeout(function() {
  	  // The request parameters
      let url = './logout';
      let data = null;
  
	  ajax('GET', url, data,
        // successful callback
        function(res) {
          let result = JSON.parse(res);
          // successfully logged out
          if(result.status === 'OK') {
        	  onSessionInvalid();
          }
        },
        // error
        function() {
          showErrorMessage('Failed to logout.');
        });
  	 }, 1500 * times);
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
  
  function getCategory() {
  	toggleTempFavItemsAtBackEnd();
  	
    let element = document.getElementById("category-menu");
    category = element.options[element.selectedIndex].text;
    console.log('tempFavItems length: ' + Object.keys(tempFavItems).length + '. Last selected category: ' + category);
  }
  
  function toggleFavItem(item) {
  	let key = 'item-' + item.itemId;
  	let root = document.getElementById(key);
  	let isPreviouslyFavorited = root.getAttribute('data-favorite') === 'true';
    let favIcon = document.getElementById('item-favIcon-' + item.itemId);
      
    // Invert the values at front-end.
    root.dataset.favorite = !isPreviouslyFavorited;
    favIcon.innerHTML = isPreviouslyFavorited ? 'star_border' : 'star';
    
    // Store { key : [item, true/false] } in tempFavItems for back-end.  
  	if(tempFavItems.hasOwnProperty(key)) { 
  	   delete tempFavItems[key];
  	} 
  	else { 
  	   tempFavItems[key] = [item, isPreviouslyFavorited];
  	}
  }
  
  /**
   * A helper function activates nav-btn class of child element of input element
   *
   * @param btnId - The id of the input element
   */
  function activeBtn(parentId) {
    let servlets = document.getElementsByClassName('servlets');
    
    for(let i = 0; i < servlets.length; i++) {
      
      if(servlets[i].id && servlets[i].id.includes('btn')) {
        let button = servlets[i];
        
        if(button.children.length > 0 && button.children[0].nodeName === 'A') {
          let link = button.children[0];
          
          if(button.id === parentId && link.className === 'nav-btn') {
            link.className = 'nav-btn active'; 
          }
          else if(button.id !== parentId && link.className === 'nav-btn active') {
            link.className = 'nav-btn';
          }
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
      if(xhr.status === 200) {
        successCallback(xhr.responseText);
      } 
      else { errorCallback(); }
    };

    xhr.onerror = function() {
      console.error("The request couldn't be completed.");
      errorCallback();
    };

    if(data === null) { xhr.send(); } 
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
    let times = toggleTempFavItemsAtBackEnd();
    hideElement(contactInfo);
    hideElement(aboutInfo);
    activeBtn('explore-btn');
  	
  	// Display loading message.
  	if(times > 0) showLoadingMessage('Saving user updates...');

    setTimeout(function() {
      // The request parameters
      let url = './search';
      let params = 'user_id=' + user_id + '&category=' + category;
      let data = null;
      
      // Display loading message.
      showLoadingMessage('Loading current openings...');
      showElement(itemList);

      // make AJAX call
      ajax('GET', url + '?' + params, data,
        // successful callback
        function(res) {
          let items = JSON.parse(res);
        
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
        });
    }, 1500 * times); 
  }
  
  /**
   * API #2 Load the random items API end point: [GET]
   * /randomsearch?user_id=1111&category=Software Development
   */
  function loadRandomsearchItems() {
  	let times = toggleTempFavItemsAtBackEnd();
    hideElement(contactInfo);
    hideElement(aboutInfo);
    activeBtn('lottery-btn');
    
    // Display loading message.
    if(times > 0) showLoadingMessage('Saving user updates...');
    
    setTimeout(function() {
      // The request parameters
      let url = './randomsearch';
      let params = 'user_id=' + user_id + '&category=' + category;
      let data = null;
      
      // Display loading message.
      showLoadingMessage('Loading random openings...');
      showElement(itemList);
      
      // make AJAX call
      ajax('GET', url + '?' + params, data,
        // successful callback
        function(res) {
          let items = JSON.parse(res);
        
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
        });
    }, 1500 * times);
  }

  /**
   * API #3 Load favorite (or visited) items API end point: [GET]
   * /history?user_id=1111
   */
  function loadFavoriteItems() {
  	let times = toggleTempFavItemsAtBackEnd();
  	hideElement(contactInfo);
    hideElement(aboutInfo);
    activeBtn('favorite-btn');
    
    // Display loading message.
    if(times > 0) showLoadingMessage('Saving user updates...');

    setTimeout(function() {
      // request parameters
      let url = './history';
      let params = 'user_id=' + user_id;
      let req = JSON.stringify({});
      
      // Display loading message.
      showLoadingMessage('Loading favorite job posts...');
      showElement(itemList);

      // make AJAX call
      ajax('GET', url + '?' + params, req, function(res) {
        let items = JSON.parse(res);
      
        if(!items || items.length === 0) {
          showWarningMessage('No favorite job post.');
        } 
        else {
          listItems(items);
        }
      }, 
      function() {
        showErrorMessage('Cannot load favorite job posts.');
      });
    }, 1500 * times);  
  }

  /**
   * API #4 Load recommended items API end point: [GET]
   * /recommendation?user_id=1111
   */
  function loadRecommendedItems() {
  	let times = toggleTempFavItemsAtBackEnd();
  	hideElement(contactInfo);
    hideElement(aboutInfo);
    activeBtn('recommend-btn');
    
    // Display loading message.
    if(times > 0) showLoadingMessage('Saving user updates...');
    
    setTimeout(function() {
      // request parameters
      let url = './recommendation' + '?' + 'user_id=' + user_id + '&category=' + category;
      let data = null;
      
      // Display loading message.
      showLoadingMessage('Loading recommended jobs...');
      showElement(itemList);
    
      // make AJAX call
      ajax('GET', url, data,
        // successful callback
        function(res) {
          let items = JSON.parse(res);
        
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
       });
    }, 1500 * times);
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
    
    for(let key in tempFavItems) {
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
         });
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
	
    for(let i = 0; i < items.length; i++) { addItem(itemList, items[i]); }
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
         <span id="title-companyName">
         	Backend Engineer (Node.js + Typescript)<br>Panther
         </span>
        </label>
        <ul>
           <li class="description">
             This is the job description.
           </li>
        </ul>
      </li>
      <li class="item-url">
        <a href="#" target="_blank">
          <i class="material-icons">open_in_new</i>
        </a>
      </li>
      <li class="item-fav">
        <i id="item-favIcon-666617" class="material-icons">star_border</i>
      </li>
    </ul>
   </li>
   */
  function addItem(itemList, item) {
    // Immediately return if any of below attributes is invalid.
    if(typeof item.itemId === 'undefined' || !item.itemId 
       || typeof item.title === 'undefined' || !item.title 
       || typeof item.companyName === 'undefined' || !item.companyName 
       || typeof item.url === 'undefined' || !item.url) { 
      return; 
    }
    
    // Optional attributes.
    let item_companyLogoUrl = './src/no-image-icon-23485.jpg';
    
    if(typeof item.companyLogoUrl !== 'undefined' && item.companyLogoUrl) {
      item_companyLogoUrl = item.companyLogoUrl;
    }
    
    let item_description = 'For more info of this job post, please click on the url link by the star button.'
    
    if(typeof item.description !== 'undefined' && item.description) {
      item_description = item.description;
    }
    
    // Check if item contains 'favorite' key. Each recommended item doesn't contain 'favorite' key.
    let hasFavorite = Object.prototype.hasOwnProperty.call(item, 'favorite');
    
    /*
    * Construct the list item from bottom-up.
    */
    
    // Create logo element <img>.
    let logo = $create('img', { src: item_companyLogoUrl }, '');
    // Create titleAndCompanyName element <span>.
    let titleAndCompanyName = $create('span', { id: 'title-companyName' }, item.title + '<br>' + item.companyName);  
    // Create id element <input>.
    let id = $create('input', { type: 'checkbox', id: item.itemId }, '');
    // Create label element <label> to host logo, title and companyName.
    let label = $create('label', { for: item.itemId, class: 'item-label' }, '');
    label.appendChild(logo);
    label.appendChild(titleAndCompanyName);
    // Create description element <li>.
    let description = $create('li', { class: 'description' }, item_description);
    // Create desList element <ul> to host description.
    let desList = $create('ul', {}, '');
    desList.appendChild(description);
    // Create job element <li> to host id, label and desList.
    let job = $create('li', { class: 'item-job' }, '');
    job.appendChild(id);
    job.appendChild(label);
    job.appendChild(desList);
    
    // Create linkIcon element <i>.
    let linkIcon = $create('i', { class: 'material-icons' }, 'open_in_new');
    // Create link element <a> to host linkIcon.
    let link = $create('a', { href: item.url, target: '_blank' }, '');
    link.appendChild(linkIcon);
    // Create url element <li> to host link.
    let url = $create('li', { class: 'item-url' }, '');
    url.appendChild(link);
    
    // Create favIcon element <i>.
    let favInnerHtml = 'star_border';
    if(hasFavorite) {
      if(item.favorite) { favInnerHtml = 'star' }
    };
    let favIcon = $create('i', { 
      id: 'item-favIcon-' + item.itemId, 
      class: 'material-icons' 
    }, favInnerHtml);
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
    if(hasFavorite) { 
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