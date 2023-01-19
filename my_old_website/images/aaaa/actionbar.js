(function(){const wpcom=window.wpcom||{};wpcom.actionbar={};wpcom.actionbar.data=window.actionbardata;const fbd=wpcom.actionbar.data;function postAction(params={},callback=()=>{}){if(!params.action){return;}
fetch(fbd.xhrURL,{method:'POST',body:new URLSearchParams(params),headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8','X-Requested-With':'XMLHttpRequest',},}).then(callback);}
let wpcomProxyPromise;function wpcomProxyLoader(){if(!wpcomProxyPromise){wpcomProxyPromise=new Promise((resolve,reject)=>{if(window.WPCOM_Proxy_Request){resolve(window.WPCOM_Proxy_Request);}else{const proxyScript=document.createElement('script');proxyScript.src=fbd.proxyScriptUrl;proxyScript.async=true;document.body.appendChild(proxyScript);proxyScript.addEventListener('load',()=>resolve(window.WPCOM_Proxy_Request));proxyScript.addEventListener('error',(error)=>reject(error));}});}
return wpcomProxyPromise;}
function postToApi(path,namespace,body={}){const request={path,body,method:'POST',apiNamespace:namespace,};wpcomProxyLoader().then((proxy)=>proxy(request));}
function bumpStat(stat,callback){postAction({action:'actionbar_stats',stat:stat,},callback);}
function followRequest(action){postAction({action:action,_wpnonce:fbd.nonce,source:'actionbar',blog_id:fbd.siteID,});}
let lastScrollTop=window.scrollY||window.pageYOffset||0;if(window!=window.top){return;}
const actionbar=document.querySelector('#actionbar');if(!actionbar){return;}
actionbar.removeAttribute('style');if(fbd.statusMessage){showActionBarStatusMessage(fbd.statusMessage);}
let isFollowBubbleOpen=false;const follow=actionbar.querySelector('.actnbr-actn-follow');const notifyPostsToggle=actionbar.querySelector('#toggle-input-notify-posts');const emailPostsToggle=actionbar.querySelector('#toggle-input-email-posts');const emailCommentsToggle=actionbar.querySelector('#toggle-input-email-comments');const frequencyOptions=actionbar.querySelectorAll('.segmented-control__link');const instantlyOption=actionbar.querySelector('.frequency-instantly');const dailyOption=actionbar.querySelector('.frequency-daily');const weeklyOption=actionbar.querySelector('.frequency-weekly');if(notifyPostsToggle){notifyPostsToggle.addEventListener('click',(e)=>{e.preventDefault();const isEnabling=e.target.parentElement.classList.toggle('is-checked');const restPath=`/read/sites/${fbd.siteID}/notification-subscriptions/${isEnabling?'new':'delete'}`;postToApi(restPath,'wpcom/v2');recordTracksEvent('wpcom_actionbar_site_notifications',{enabling:isEnabling,follow_source:'actionbar',url:fbd.siteURL,});});}
if(emailPostsToggle){emailPostsToggle.addEventListener('click',(e)=>{e.preventDefault();const isEnabling=e.target.parentElement.classList.toggle('is-checked');const restPath=`/read/site/${fbd.siteID}/post_email_subscriptions/${isEnabling?'new':'delete'}`;let body={};if(isEnabling){body.delivery_frequency=fbd.subsEmailDefault;frequencyOptions.forEach((opt)=>opt.parentElement.classList.remove('is-selected'));actionbar.querySelector(`.frequency-${fbd.subsEmailDefault}`).parentElement.classList.add('is-selected');}
actionbar.querySelector('#email-new-posts-details').classList.toggle('is-visible',isEnabling);postToApi(restPath,'rest/v1.2',body);});}
if(emailCommentsToggle){emailCommentsToggle.addEventListener('click',(e)=>{e.preventDefault();const isEnabling=e.target.parentElement.classList.toggle('is-checked');const restPath=`/read/site/${fbd.siteID}/comment_email_subscriptions/${isEnabling?'new':'delete'}`;postToApi(restPath,'rest/v1.2');});}
const onFrequencyOptionClick=(e,frequencyKey)=>{frequencyOptions.forEach((opt)=>opt.parentElement.classList.remove('is-selected'));e.target.parentElement.classList.add('is-selected');const restPath=`/read/site/${fbd.siteID}/post_email_subscriptions/update`;postToApi(restPath,'rest/v1.2',{delivery_frequency:frequencyKey});};if(frequencyOptions.length>0){instantlyOption.addEventListener('click',(e)=>onFrequencyOptionClick(e,'instantly'));dailyOption.addEventListener('click',(e)=>onFrequencyOptionClick(e,'daily'));weeklyOption.addEventListener('click',(e)=>onFrequencyOptionClick(e,'weekly'));}
if(follow){follow.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();isFollowBubbleOpen=true;if(fbd.isLoggedIn){showActionBarStatusMessage(`<div class="actnbr-reader">${fbd.i18n.followedText}</div>`);
				bumpStat('followed');
				recordTracksEvent('wpcom_actionbar_site_followed', {
					follow_source: 'actionbar',
					url: fbd.siteURL,
				});

				followRequest('ab_subscribe_to_blog');
				const defaultEmailFrequency = fbd.subsEmailDefault;
				if (defaultEmailFrequency !== 'never') {
					emailPostsToggle.click();
				}

				notifyPostsToggle && notifyPostsToggle.click();

			} else {
				showActionBarFollowForm();
			}
		});
	}

	// Unfollow site
	const unfollow = actionbar.querySelector('.actnbr-actn-following');
	if (unfollow) {
		unfollow.addEventListener('click', (e) => {
			e.preventDefault();
			unfollow.classList.add('no-display');
			follow.classList.remove('no-display');

			bumpStat('unfollowed');
			recordTracksEvent('wpcom_actionbar_site_unfollowed', {
				follow_source: 'actionbar',
				url: fbd.siteURL,
			});

			followRequest('ab_unsubscribe_from_blog');

			const btn = actionbar.querySelector('.actnbr-btn');
			btn.classList.add('actnbr-hidden');
			const followNotificationCheckedToggles = actionbar.querySelectorAll('.actnbr-site-settings__toggle.is-checked');
			followNotificationCheckedToggles.forEach((t) => t.classList.remove('is-checked'));
		});
	}

	// Dismiss follow bubble when clicking on document
	document.addEventListener('click', (e) => {
		const isClickInPopup = !!e.target.closest('#follow-bubble');

		if (isClickInPopup) {
			return;
		}
		const btn = actionbar.querySelector('.actnbr-btn');

		if (isFollowBubbleOpen && !btn.classList.contains('actnbr-hidden')) {
			isFollowBubbleOpen = false;
			btn.classList.add('actnbr-hidden');
		}
	});

	// Show shortlink prompt
	const shortlink = actionbar.querySelector('.actnbr-shortlink a');
	if (shortlink) {
		shortlink.addEventListener('click', (e) => {
			e.preventDefault();
			if (window.electron) {
				// Electron does not support the window.prompt API.
				// So we have to copy to the clipboard by sending the
				// content to be copied through Electron's IPC channels.
				window.electron.send('copy-text-to-clipboard', fbd.shortlink);
			} else {
				window.prompt('Shortlink: ', fbd.shortlink);
			}
		});
	}

	const ellipsis = actionbar.querySelector('.actnbr-ellipsis');
	let isMenuOpen = false;
	if (ellipsis) {
		ellipsis.addEventListener('click', (e) => {
			const closestLink = e.target.closest('a');
			if (closestLink && closestLink.classList.contains('actnbr-action')) {
				return false;
			}

			ellipsis.classList.toggle('actnbr-hidden');

			setTimeout(() => {
				if (!ellipsis.classList.contains('actnbr-hidden')) {
					bumpStat('show_more_menu');
					isMenuOpen = true;
				}
			}, 10);
		});
	}

	// Dismiss menu when clicking on document
	document.addEventListener('click', () => {
		if (isMenuOpen) {
			ellipsis.classList.add('actnbr-hidden');
			isMenuOpen = false;
		}
	});

	// Fold/Unfold
const fold=actionbar.querySelector('.actnbr-fold');if(fold){fold.addEventListener('click',(e)=>{e.preventDefault();const link=fold.querySelector('a');if(actionbar.classList.contains('actnbr-folded')){link.textContent=fbd.i18n.foldBar;actionbar.classList.remove('actnbr-folded');postAction({action:'unfold_actionbar'});}else{link.textContent=fbd.i18n.unfoldBar;actionbar.classList.add('actnbr-folded');postAction({action:'fold_actionbar'});}});}
function statsOnClick(selector,stat,additionalEffect){const el=actionbar.querySelector(selector);if(el){el.addEventListener('click',createStatsBumperEventHandler(stat,additionalEffect));}}
statsOnClick('.actnbr-sitename a','clicked_site_title');statsOnClick('.actnbr-customize a','customized');statsOnClick('.actnbr-folded-customize a','customized');statsOnClick('.actnbr-theme a','explored_theme');statsOnClick('.actnbr-edit a','edited');statsOnClick('.actnbr-stats a','clicked_stats');statsOnClick('.flb-report a','reported_content');statsOnClick('.actnbr-follows a','managed_following');statsOnClick('.actnbr-login-nudge a','clicked_login_nudge');statsOnClick('.actnbr-signup a','clicked_signup_link');statsOnClick('.actnbr-login a','clicked_login_link');statsOnClick('.actnbr-subs a','clicked_manage_subs_link');statsOnClick('.actnbr-reader a','view_reader');if(shortlink){shortlink.addEventListener('click',bumpStat('copied_shortlink'));}
const bubbleForm=actionbar.querySelector('.actnbr-follow-bubble form');if(bubbleForm){bubbleForm.addEventListener('submit',createStatsBumperEventHandler('submit_follow_form',()=>{const button=bubbleForm.querySelector('button');if(button){button.setAttribute('disabled',true);}}));}
function handleScroll(){const scrollTop=window.scrollY||window.pageYOffset||0;const isHidden=actionbar.classList.contains('actnbr-hidden');if(scrollTop<lastScrollTop){actionbar.classList.remove('actnbr-hidden');}else{if(!isHidden&&document.querySelectorAll('#actionbar > ul > li:not(.actnbr-hidden) > .actnbr-popover').length===0){actionbar.classList.add('actnbr-hidden');actionbar.querySelectorAll('li').forEach((menu)=>menu.classList.add('actnbr-hidden'));}}
lastScrollTop=scrollTop;}
document.addEventListener('scroll',handleScroll,{passive:true});function recordTracksEvent(eventName,eventProps){eventProps=eventProps||{};window._tkq=window._tkq||[];window._tkq.push(['recordEvent',eventName,eventProps]);}
function createStatsBumperEventHandler(stat,additionalEffect){const completedEvents={};return function eventHandler(event){if(completedEvents[event.timeStamp]){delete completedEvents[event.timeStamp];if(event.type==='submit'){event.target.submit();}
if(typeof additionalEffect==='function'){return additionalEffect(event);}
return true;}
event.preventDefault();event.stopPropagation();function dispatchOriginalEvent(){const newEvent=new event.constructor(event.type,event);completedEvents[newEvent.timeStamp]=true;event.target.dispatchEvent(newEvent);}
bumpStat(stat,dispatchOriginalEvent);};}
function showActionBarFollowForm(){const form=actionbar.querySelector('.actnbr-follow-bubble form');form.removeAttribute('style');const button=actionbar.querySelector('.actnbr-btn');button&&button.classList.toggle('actnbr-hidden');setTimeout(()=>{actionbar.querySelector('.actnbr-email-field').focus();},10);}
function showActionBarStatusMessage(message){follow&&follow.classList.add('no-display');unfollow&&unfollow.classList.remove('no-display');const msgEl=actionbar.querySelector('.actnbr-follow-bubble .actnbr-message');if(msgEl){msgEl.innerHTML=message;}
const button=actionbar.querySelector('.actnbr-btn');button&&button.classList.remove('actnbr-hidden');}})();