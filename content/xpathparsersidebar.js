var xpathParserSideBar = {
    currUrl : null,
    currentDoc:  autopagerUtils.currentDocument(),
};

xpathParserSideBar.onLoad = function(){
	var sidebar = window.top.document.getElementById("sidebar");
        if (sidebar)
        {
			//alert("load");
            //autopagerSidebar.orgPriority = sidebar.style.getPropertyPriority ("max-width");
            //autopagerSidebar.maxWidth = sidebar.style.getPropertyValue ("max-width");

            sidebar.style.removeProperty("max-width");
            //sidebar.addEventListener("DOMAttrModified",this.changed,false);
            var sidebarBox = window.top.document.getElementById("sidebar-box");
            //sidebarBox.addEventListener("DOMAttrModified",this.changed,false);
            var sheets = window.top.document.styleSheets
            for(var i=0;i<sheets.length;i++)
            {
                    if('chrome://autopager/skin/autopager-toolbar.css' == sheets.item(i).href)
                    {
                            var sheet = sheets.item(i);
                            sheet.insertRule("#sidebar-box { overflow-x: hidden !important;}",sheet.cssRules.length);
                            sheet.insertRule("#sidebar {  min-width: 0px !important;    max-width: none !important;    overflow-x: hidden !important;}",sheet.cssRules.length);
                    }
            }
            if (sidebarBox.boxObject.width<400)
                sidebarBox.setAttribute("width",400)
        }
};

xpathParserSideBar.getTextId = function(type){
    return type + "_xpath_text";
};

xpathParserSideBar.fields = [
    'category',
    'title',
    'pages',
    'date',
    'tag',
    'content',
    'source'
];

xpathParserSideBar.getTestState = function(){
        var testBtn = document.getElementById('test');
        if(testBtn == null){
                alert("Can determine the test state");
        }
        return testBtn.checked;
};

xpathParserSideBar.selectXpath = function(type){
    //window.alert(type);
    autopagerSelector.clearFunctions();
    var url = autopagerUtils.currentDocument().domain;
    document.getElementById('web_url_label').value = url;
    var text_box = document.getElementById(this.getTextId(type));
    var treeBody = document.getElementById('xpathTreeBody');
    treeBody.parentNode.type = type;
    autopagerSelector.registorSelectFunction(
        function (elem){
            var arr = xpathExtract.getXpath(elem, type);
            var endfix="";
            switch(type){
                case 'category':
                    endfix="//a//text()";
                    break;
                case 'title':
                case 'date':
                    endfix="//text()";
                    break;
                case 'source':
                    endfix="//text()";
                case 'pages':
                default:
                    break;  
            }
            for(var i in arr){
                arr[i].xpath = arr[i].xpath + endfix;
            }
            if(arr.length > 0){
                text_box.value = arr[0].xpath;

            }
            xpathParserSideBar.showXPathList(treeBody, arr);
            
            if(xpathParserSideBar.getTestState()){
                //in testing , compare the xpath gathered with the stored
                var module = document.getElementById('xpath_total').module;
                if(module == null || module.domain != url){
                    alert("please generate a module based on " + url + " first");
                    return ;
                }
		var key = xpathParserSideBar.getKey(type);
                if(module[key][0].xpath == arr[0].xpath){
                    alert("matched");
                }else{
                    alert("not matched\n" + module[key][0].xpath + " : " + arr[0].xpath);
                }
            }
        }
     );
    
    autopagerSelector.start(autopagerUtils.currentBrowser());
};

xpathParserSideBar.setXPath = function(){
    var tree = document.getElementById('xpathTree');
    var view = tree.view;
    var list = tree.xpath_items;
    var xpathItem = list[view.selection.currentIndex];
    var textBox = document.getElementById(this.getTextId(tree.type));
    if(textBox != null){
        textBox.value = xpathItem.xpath;
    }
    xpathParserSideBar.searchXPath(xpathItem.xpath);
};

xpathParserSideBar.searchXPath = function(xpath){
    var doc = autopagerUtils.currentDocument();
    var result = xpathExtract.evaluate(doc, xpath, true);
    xpathParserSideBar.updateHtmlResults(result);
};

xpathParserSideBar.updateHtmlResults = function(results){
    var contentFrame = document.getElementById('resultsFrame');
    var doc = contentFrame.contentDocument;
    xpathParserSideBar.clearNoneLink(contentFrame.contentDocument.documentElement);

    var table = xpathParserSideBar.addNode(contentFrame.contentDocument.documentElement,"table");
    var tbody = xpathParserSideBar.addNode(table,"tbody");
        

    //autopagerHightlight.HighlightNodes(autopagerUtils.currentDocument(),results,-1,"black");
    for (var i in results) {
        var node = results[i]

        node.blur = true;
        var label = (parseInt(i)+1)+":"

        var row = xpathParserSideBar.addNode(tbody,"tr");
        var td1 = xpathParserSideBar.addNode(row,"td");
        var td2 = xpathParserSideBar.addNode(row,"td");

        xpathParserSideBar.addTextNode(td1, label);
        if (!node.nodeType){
            xpathParserSideBar.addTextNode(td2, node + "\n");
        }
        else if (node.nodeType != 2){
            var n = contentFrame.contentDocument.importNode(node.cloneNode(true),true);
            td2.appendChild (n);
        }else{
            xpathParserSideBar.addTextNode(td2, node.nodeName + "=" + node.nodeValue + "\n");
            var n1 = contentFrame.contentDocument.importNode(node.ownerElement.cloneNode(true),true);
            td2.appendChild (n1);
        }
    }
};

xpathParserSideBar.clearNoneLink = function(node)
{
    var n = node.firstChild;
    while(n != null)
    {
        var curr=n;
        n = curr.nextSibling;
        if (!(curr instanceof HTMLLinkElement))
        {
            node.removeChild(curr); 
        }
    }         
};
    
xpathParserSideBar.showXPathList = function(treeChild,lists)
{
    treeChild.parentNode.xpath_items = lists;
    xpathParserSideBar.clearNode(treeChild);
    for (var i in lists) 
    {
        var xpath_item = lists[i];
        var treeitem = this.addNode(treeChild,"treeitem");
        treeitem.xpath = xpath_item;
            
        var treerow = this.addNode(treeitem,"treerow");
        
        var treecell = this.addNode(treerow,"treecell");
        treecell.setAttribute("label", xpath_item.xpath);
        
        treecell = this.addNode(treerow,"treecell");
        treecell.setAttribute("label", xpath_item.authority)
    }
};

xpathParserSideBar.addTextNode = function (pNode,text){
    var node = pNode.ownerDocument.createTextNode(text);
    pNode.appendChild(node);
    return node;
};

xpathParserSideBar.addNode = function (pNode,name){
    var node = pNode.ownerDocument.createElement(name);
    pNode.appendChild(node);
    return node;
};

xpathParserSideBar.insertNode = function(pNode, name){
   var node = pNode.ownerDocument.createElement(name);
   pNode.insertBefore(node, pNode.firstChild);
   return node;
};

xpathParserSideBar.clearNode = function (node){
    while(node.hasChildNodes()){ node.removeChild(node.firstChild); } 
};

xpathParserSideBar.generateXPath = function(url_label, write_label){
    var write_area = document.getElementById(write_label);
    var url_area = document.getElementById(url_label);
    if(write_area == null || url_area == null) return;
    var module = this.DefaultNetModule();
    module.domain = url_area.value;
    for(var i in xpathParserSideBar.fields){
	var key = this.getKey(this.fields[i]);
        var text = document.getElementById(this.getTextId(this.fields[i])).value;
        if(text.length > 0){
	    var rule = new Rule();
	    rule.xpath = text;
            module[key].unshift(rule);
        }
    }
    
    write_area.module = module;
    this.showXPath(write_area);
};

xpathParserSideBar.getKey = function(type){
    return "parse_" + type;
};

xpathParserSideBar.selectSeed = function(txt_id){
    autopagerSelector.clearFunctions();
    autopagerSelector.registorSelectFunction(
	function(elem){
		var achor_list = new Array();
		if(elem.tagName != 'A'){
			select_a_xpath = ".//a"
			achor_list = xpathExtract.evaluate(elem, select_a_xpath, true);
		}else{
			achor_list.push(elem);
		}
		
		cur_url = autopagerUtils.currentDocument().URL;
		//alert(cur_url);
		get_url_pos = function(cur_array, url_str){
			//解析相对地址
			//cur_array = current_url.split('/');
			//alert('new ');
			//alert(cur_array.join(':'));
			//alert(url_str);
			pre_addr_pos = url_str.indexOf('/');
			if(pre_addr_pos == -1){
				cur_array.pop();
				cur_array.push(url_str);
			}else{
				pre_addr = url_str.substr(0,pre_addr_pos)
				if(pre_addr=="."){
					get_url_pos(cur_array, url_str.substr(pre_addr_pos+1));
				}
				if(pre_addr == ".."){
					cur_array.pop()
					get_url_pos(cur_array, url_str.substr(pre_addr_pos+1));
				}
				else{
					cur_array.push(url_str);
				}
			}
		}
		
		var result_list = new Array();
		//alert(achor_list.length);
		for(achor_idx in achor_list){
			achor = achor_list[achor_idx];
			if(achor.tagName != "A"){
				continue;
			}
			if(achor.getAttribute("href") != null){
				url = achor.getAttribute('href')
				if(url.substr(0,4) != "http"){
					//相对地址，需要解析
					if(url.charAt(0) == '/'){
						//根目录引用
						url = achor.hostname + url;
					}else{
						//alert(cur_url);
						url_array = cur_url.split('/');
						result_array = get_url_pos(url_array, url);
						url = url_array.join('/');
						
					}
					final_url = achor.text + "::" + url;
					result_list.push(final_url);
				}else{
					result_list.push(achor.text + "::" + url);
				}
				
			}
		}
		
		text_box = document.getElementById(txt_id);
		text_box.value = result_list.join("\n");
		/*
		else{
			//alert("current url" + autopagerUtils.currentDocument().URL);
			if(elem.getAttribute("href") != null){
				
				//alert(autopagerUtils.currentDocument().baseURI);
				cur_url = autopagerUtils.currentDocument().defaultView.location;
				//alert(elem.rel);
				//alert(elem.hostname);
				//alert(autopagerUtils.currentWindow().document.location);
				url = elem.getAttribute('href')
				if(url.substr(0,4) != "http"){
					if(url.charAt(0) == '/'){
						url = base + url;
					}else{
						//根据目录来分析了。。
						cur_url_array = cur_url.split('/');
						cur_url_array.pop();
						get_pos = function(array, pos_url){
							pos = pos_url.indexOf('/')
							if(pos == -1){
								cur_url_array.push(pos_url);
							}
							else{
								level = pos_url.subString(0,pos)
								if(level=="."){
									get_pos(array, pos_url.subString(pos+1));
								}
								if(level == ".."){
									array.pop()
									get_pos(array, pos_url.subString(pos + 1));
								}
							}
						}
						get_pos(cur_url_array, url);
						url = cur_url_array.join('/');
					}
					url = elem.protocol + "//" + url;
				}
				//alert(url);
				
			}
			else{
				alert("how come a <a> doesn't have 'href'??");
			}
		}*/
	}
    );
   autopagerSelector.start(autopagerUtils.currentBrowser());
};

xpathParserSideBar.showXPath = function(write_area){
    if(write_area.module == null) return;
    write_area.value = JSON.stringify(write_area.module, null, 4);  
};

xpathParserSideBar.Add = function(id){
   var text = document.getElementById(this.getTextId(id));
   var xpath = text.value;
	
   if((xpath.length) > 0){

	var treeChild = document.getElementById('xpathTreeBody');
        var item = new xpathItem();
        item.xpath = xpath;
	treeChild.parentNode.xpath_items.unshift(item);
        var treeitem = this.insertNode(treeChild,"treeitem");
        treeitem.xpath = xpath;
        var treerow = this.addNode(treeitem,"treerow");
        var treecell = this.addNode(treerow,"treecell");
        treecell.setAttribute("label", xpath);
   }
};

NetModule = function(){
};

//this function generates default NetRuleModule 
xpathParserSideBar.DefaultNetModule = function(){
    var module = new NetModule();
    var tag_rule = new Rule();
    tag_rule.xpath = "//meta[@name='keywords'or @name='Keywords']/@content";
    module.parse_tag = [];
    module.parse_tag.push(tag_rule);

    module.parse_category=[];

    var title_rule = new Rule();
    title_rule.xpath="//head/title/text()";
    title_rule.re = "([^_]*)_.*";
    module.parse_title=[];
    module.parse_title.push(title_rule);
    
    module.parse_pages=[];
    module.parse_date =[];
    module.parse_content = [];
    module.parse_source = [];
    return module;
};

Rule = function(){
};
