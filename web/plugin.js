(function () {


  /**
   * A dashboard tab for sample files.
   *
   * @constructor
   */
  sync.ui.SamplesTab = function () {
  };
  goog.inherits(sync.ui.SamplesTab, sync.ui.AbstractDashboardTab);

  /** @override */
  sync.ui.SamplesTab.prototype.getTabHeaderImage = function () {
    return sync.util.computeHdpiIcon("../plugin-resources/webdav-server/Samples70.png");
  };

  /** @override */
  sync.ui.SamplesTab.prototype.getTabHeaderDisplayName = function () {
    return tr(msgs.SAMPLES_);
  };

  /** @override */
  sync.ui.SamplesTab.prototype.insertTabContent = function (parentElement) {
    if (!this.samplesContainer) {
      var cD = goog.dom.createDom;
      // construct the dom structure for the samples.
      var domHelper = new goog.dom.DomHelper();
      this.samplesContainer = cD('div', {id: 'dashboard-samples-container'});
      this.samplesContainer.style.display = 'none';
      this.samplesContainer.style.position = 'relative';
      var descriptor = retrieveSamplesDescriptor();
      if (descriptor) {
        var samples = descriptor['samples'];
        var titleCss = '';

        for (var i in samples) {
          var sample = samples[i];
          var path = sample['path'];
          var ditamap = sample['ditamap'];
          var imagePath = sample['image'];
          var labels = sample['labels'];
          var newLabels = sample['newLabels'];
          var urlParams = sample['urlParams'];
          var newSample = sample['new'];
          
          var defaultImage = false;
          if (!imagePath) {
            // The default image (if no one is provided in the samples descriptor)
            imagePath = "plugin-resources/webdav-server/MissingImage.png";
            defaultImage = true;
          }
          imagePath = sync.util.computeHdpiIcon(imagePath);

          // Open the sample document in a new tab when the sample image is clicked.
          var author = sync.util.getURLParameter('author') || tr(msgs.ANONYMOUS_);
          var openUrl = getUrl(path, ditamap, author, urlParams);
          var sampleName = sample['name'];
          var sampleId = 'sample-title-' + sampleName.replace(/ /g, '-');

          // Make label elements.
          var labelElements = [];
          if (newLabels) {
            var newLabelsTexts = newLabels.split(',');
            for (var j in newLabelsTexts) {
              var newLabelText = newLabelsTexts[j];
              if (newLabelText) {
                labelElements.push(cD('span', 'dashboard-new-sample-label', newLabelText.trim()));
              }
            }
          }
          if (labels) {
            var labelsTexts = labels.split(',');
            for (var k in labelsTexts) {
              var labelText = labelsTexts[k];
              if (labelText) {
                labelElements.push(cD('span', 'dashboard-sample-label', labelText.trim()));
              }
            }
          }

          var dashboardSample = cD('a', {
              className: 'dashboard-sample',
              target: '_blank',
              href: openUrl,
              id: sampleId
            },
            cD('img', {
              className: 'dashboard-sample-image',
              alt: '', // Mark image as presentation only (a11y).
              src: (defaultImage ? '../' : webdavServerPluginUrl) + imagePath
            }),
            cD('div', 'dashboard-sample-name', sampleName),
            cD('div', 'dashboard-sample-labels',
              labelElements
            )
          )

          goog.dom.appendChild(this.samplesContainer, dashboardSample);

          if (newSample) {
            goog.dom.classlist.add(dashboardSample, 'new-dashboard-sample');
          }
        }
        // add styles before adding the elements.
        addNewStylesheet(domHelper, titleCss);
      }
    }

    parentElement.appendChild(this.samplesContainer);

    if (descriptor && descriptor.trustedHostNotConfigured) {
      var transparentLayer = cD("div", "not-configured");
      goog.style.setStyle(
        transparentLayer,
        {
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          background: "#cdcdcd",
          opacity: "0.2"
        }
      );

      var adminPageLink = href.substring(0, href.length - "oxygen.html".length) + "admin.html#Security";
      var configureTrustedHostLabel = cD("div", null,
        [
          cD("span", {},
            trDom(msgs.SERVER_NOT_TRUSTED, {
            '$SERVER': cD("i", {}, window.webdavServerPluginUrl),
            '$ADM_PAGE': cD("a", {href: adminPageLink}, tr(msgs.ADMINISTRATION_PAGE))
          }))
        ]);
      goog.style.setStyle(
        configureTrustedHostLabel,
        {
          position: "absolute",
          top: "0em",
          left: "0em",
          background: "white",
          padding: "0.5em",
          width: "100%",
          borderBottom: "1px solid #AAAAAA",
          fontSize: "1.1em",
          textAlign: "left"
        }
      );

      goog.dom.appendChild(this.samplesContainer, transparentLayer);
      goog.dom.appendChild(this.samplesContainer, configureTrustedHostLabel);
    }
  };

  /**
   * Returns a JSON containg information about all samples that must be rendered in the "Samples" tab.
   *
   * @return Object data JSON Object with details about samples
   */
  function retrieveSamplesDescriptor() {
    var descriptorUrl = webdavServerPluginUrl + '.descriptor/samples.json?serverUrl=' +
        encodeURIComponent(window.webdavServerPluginUrl + '.descriptor/samples.json');
    var request = new XMLHttpRequest();
    request.open('GET', descriptorUrl, false);
    request.send();
    return JSON.parse(request.responseText);
  }

  /**
   * Compute the document url depending on params.
   *
   * @param docUrl the document url.
   * @param ditamapUrl the ditamap url.
   * @param authorName the author name.
   * @param urlParams url parameters.
   *
   * @return {string} the document url.
   */
  function getUrl(docUrl, ditamapUrl, authorName, urlParams) {
    var urlStr = "oxygen.html?";
    urlStr += 'url=' + getWebdavUrl(docUrl);
    if (ditamapUrl) {
      urlStr += '&ditamap=' + getWebdavUrl(ditamapUrl);
    }

    if (urlParams) {
      for (var paramName in urlParams) {
        var paramValue = urlParams[paramName];
        if (paramName === 'diffUrl' || paramName === 'diffBaseUrl' || paramName === 'schematronUrl') {
          paramValue =  getWebdavUrl(paramValue);
        }
        urlStr += '&' + paramName + '=' + paramValue;
      }
    }

    urlStr += '&author=' + authorName;
    return urlStr;
  }

  /**
   * Get the webdav URL corresponding to a relative path.
   *
   * @param path The relative path.
   * @return {string} The webdav URL.
   */
  function getWebdavUrl(path) {
    return 'webdav-' + encodeURIComponent((webdavServerPluginUrl + path).replace('\\', '/'));
  }

  /**
   * Add styles to the document.
   *
   * @param domHelper the document helper.
   * @param dynamicCss the dynamic CSS to be added to the document.
   */
  function addNewStylesheet(domHelper, dynamicCss) {
    var cssFormating = domHelper.createDom('style');
    cssFormating.textContent =
      '#dashboard-samples-container {' +
      'display: block !important;' +
      'text-align: center;' +
      '}' +

      '.dashboard-sample.new-dashboard-sample:before {' +
      '    content: "";' +
      '    height: 25px;' +
      '    width: 37px;' +
      '    top: 45px;' +
      '    left: 5px;' +
      '    position: absolute;' +
      '    background: url(../plugin-resources/webdav-server/NewSample.png) no-repeat left;' +
      '}' +

      '@media only screen and (min-width: 768px) {' +
      '#dashboard-samples-container {' +
      'padding: 30px 60px;' +
      '}' +
      '}' +

      '#dashboard-samples-container .dashboard-sample-image {' +
      'background-color: #FFFFFF;' +
      'display: inline-block;' +
      'height: 159px;' +
      'width: 125px;' +
      'margin:50px 10px 0px;' +
      'border: 2px solid #cccccc;' +
      '}' +

      '.dashboard-sample {' +
      'display: inline-block;' +
      'margin: 5px 40px 5px 40px;' +
      'text-decoration:none;' +
      'position: relative;' +
      '}' +

      '.dashboard-sample-labels {' +
      'display: block;' +
      'margin-bottom: 10px;' +
      ' }' +

      '.dashboard-sample-label, .dashboard-new-sample-label {' +
      'font-size: 70%;' +
      'border: 0px solid #ddd;' +
      'border-radius: 4px;' +
      'padding: 1px 6px;' +
      'margin-left: 5px;' +
      'cursor: pointer;' +
      ' }' +
      
      '.dashboard-sample-label {' +
      'background-color: #b4b4b4;' +
      'color: #fff;' +
      ' }' +
      
      '.dashboard-new-sample-label {' +
      'background-color: #fecb7c;' +
      'color: #000;' +
      'font-weight: bold;' +
      ' }' +


      '#dashboard-samples-container .dashboard-sample-image:hover {' +
      'border-color: #34789d;' +
      '}' +

      '#dashboard-samples-container .dashboard-sample:hover .dashboard-sample-image {' +
      'border-color: #34789d;' +
      '}' +


      '.dashboard-sample:hover .dashboard-sample-label {' +
      'background-color: #34789d;' +
      ' }' +

      '.dashboard-sample:hover .dashboard-new-sample-label {' +
      'background-color: #fdb443;' +
      ' }' +

      '.dashboard-sample-name {' +
      'background-color: transparent;' +
      'cursor:default;' +
      '    font-family: Roboto, Arial, Helvetica, sans-serif;' +
      'color: #595959;' +
      'display:block;' +
      'position: relative;' +
      'margin: 10px 0px 5px;' +
      '}' +
      (dynamicCss ? dynamicCss : '');

    document.head.appendChild(cssFormating);
  }

  var readonlySaveDialog = null;
  var href = location.href;
  var endIndex = href.indexOf('/app/');
  if (endIndex === -1) {
    endIndex = href.indexOf('/static/');
  }

  var baseUrl = href.substring(0, endIndex + 1) + 'plugins-dispatcher/webdav-server/';
  // global variable with the server url.
  window.webdavServerPluginUrl = baseUrl;

  // enforce the url if option enabled.
  if('on' === sync.options.PluginsOptions.getClientOption('webdav_server_plugin_enforce_url')) {
    window.addEnforcedWebdavUrl && window.addEnforcedWebdavUrl(baseUrl);
  }

  // load samples thumbails.
  goog.events.listen(
    workspace, sync.api.Workspace.EventType.BEFORE_DASHBOARD_LOADED, function() {
      if (sync.options.PluginsOptions.getClientOption('display_samples') === "on") {
        workspace.addDashboardAdditionalTabs(new sync.ui.SamplesTab());
      }
    });

  /**
   * Replace the save action when the the server is readonly.
   */
  if(decodeURIComponent(sync.util.getURLParameter('url'))
      .indexOf('plugins-dispatcher/webdav-server/') !== -1) {

    var readonlyMode = sync.options.PluginsOptions.getClientOption('webdav_server_plugin_readonly_mode') === 'on' ||
      sync.util.getURLParameter('webdav_disable_save') === 'true';
    if(readonlyMode) {
      // Disable autosave for the WebDAV server plugin.
      sync.options.PluginsOptions.clientOptions['webdav_autosave_interval'] = '0';

      goog.events.listen(workspace, sync.api.Workspace.EventType.EDITOR_LOADED, readOnlyEditorLoaded);
    }
  }

  /**
   * Editor Loaded callback.
   *
   * @param e the editor loaded event.
   */
  function readOnlyEditorLoaded(e) {
    // load the css rules used in the editor.
    loadEditorCSS();

    var editor = e.editor;
    goog.events.listen(editor, sync.api.Editor.EventTypes.ACTIONS_LOADED, function(e) {
      var saveAction = editor.getActionsManager().getActionById('Author/Save');
      if (saveAction) {
        // override save action
        saveAction.actionPerformed = function(callback) {
          // create the dialog
          if(!readonlySaveDialog) {
            readonlySaveDialog = workspace.createDialog();
            readonlySaveDialog.setTitle(tr(msgs.READ_ONLY_DOCUMENT_));
            goog.dom.removeChildren(readonlySaveDialog.getElement());
            var googCreateDom = goog.dom.createDom;
            goog.dom.append(readonlySaveDialog.getElement(),
              googCreateDom('div', {id: 'readonly-save-dialog'},
                trDom(msgs.WEBDAV_READ_ONLY_MODE_, {
                  '$P_START': {
                    end: '$P_END',
                    node: googCreateDom('p')
                  },
                  '$B_START': {
                    end: '$B_END',
                    node: googCreateDom('b')
                  }
                })
              )
            );
            readonlySaveDialog.setButtonConfiguration(sync.api.Dialog.ButtonConfiguration.OK);
          }
          readonlySaveDialog.onSelect(callback);
          readonlySaveDialog.show();
        }
      }

      /**
       * An action which tells the user that saving is not possible.
       * @constructor
       * @extends {sync.actions.AbstractAction}
       */
      function CantSaveAction(keyStroke) {
        sync.actions.AbstractAction.call(this, keyStroke);
      }
      CantSaveAction.prototype = Object.create(sync.actions.AbstractAction.prototype);
      CantSaveAction.prototype.constructor = CantSaveAction;

      /**
       * @param callback The actionPerformed callback.
       */
      CantSaveAction.prototype.actionPerformed = function (callback) {
        if (editor.isDirty()) {
          workspace.getNotificationManager().showWarning(tr(msgs.DOCUMENT_OPENED_AS_READ_ONLY_));
        }
        callback();
      };

      // // WA-2274: Disable the Ctrl+S shortcut.
      editor.getActionsManager().registerAction('WebdavServer/CantSaveAction', new CantSaveAction("M1 S"), "M1 S");

      if(e.actionsConfiguration.toolbars.length) {
        var toolbarActions = e.actionsConfiguration.toolbars[0].children;
        for (var i = 0; i < toolbarActions.length; i ++) {
          var currentAction = toolbarActions[i];
          if (currentAction.id === 'Author/Save') {
            // Replace the Save action withe download.
            var downloadActionDescriptor = {id: 'Author/Download', type: 'action'};
            toolbarActions.splice(i, 1, downloadActionDescriptor);
          }
        }
      }
    });
  }

  var cssFormating = null;
  function loadEditorCSS() {
    if (!cssFormating) {
      var domHelper = new goog.dom.DomHelper();
      cssFormating = domHelper.createDom('style');
      cssFormating.textContent =
        '#readonly-save-dialog {' +
          'content: " ";'+
          'width: 400px;' +
          'line-height: 1.2em;' +
        '}' +
        '#readonly-save-dialog {' +
          'text-indent: 10px;' +
        '}';
      document.head.appendChild(cssFormating);
    }
  }

  setTimeout(function() {
    var createActions = workspace.getActionsManager().getCreateActions();
    for(var i = 0; i < createActions.length; i++) {
      var createAction = createActions[i];
      if(createAction.getActionId() === 'webdav-create-action') {
        var urlChooser = createAction.urlChooser;
        var originalRequestUrlInfo_ = goog.bind(urlChooser.requestUrlInfo_, urlChooser);
        urlChooser.requestUrlInfo_ = function(url, callback) {
          if(url && url.indexOf('/plugins-dispatcher/webdav-server/') !== -1) {
            callback(url, {
              rootUrl: url.substring(0, url.indexOf('/plugins-dispatcher/webdav-server/') + '/plugins-dispatcher/webdav-server/'.length),
              type: goog.string.endsWith(url, '/') ? 'COLLECTION' : 'FILE'
            });
          } else {
            originalRequestUrlInfo_(url, callback);
          }
        }.bind(urlChooser);

        break;
      }
    }
  }, 0);
})();
