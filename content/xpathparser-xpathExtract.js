var xpathExtract = typeof xpathExtract != "undefined"?xpathExtract:{};

//tagname in these keywords will be used for xpath generate
xpathExtract.keywords = new Array(
    'div',
    'span',
    'h1',
    'h2',
    'article',
    'p',
    'h3'
);

xpathExtract.pathAuthority_rule = {
        keyword_auth : 6,
        level_dividor_auth : 0.2,
        original_auth : 6,
        found_auth      : 1,
        length_auth     : 0.05
};

xpathExtract.XPathResult = {    
        ANY_TYPE 	:0,
        NUMBER_TYPE 	:1,
        STRING_TYPE 	:2,
        BOOLEAN_TYPE 	:3,
        UNORDERED_NODE_ITERATOR_TYPE 	:4,
        ORDERED_NODE_ITERATOR_TYPE 	:5,
        UNORDERED_NODE_SNAPSHOT_TYPE 	:6,
        ORDERED_NODE_SNAPSHOT_TYPE 	:7,
        ANY_UNORDERED_NODE_TYPE 	:8,
        FIRST_ORDERED_NODE_TYPE 	:9
};


xpathExtract.isKeywords = function(word){
  for(var i in xpathExtract.keywords){
    if(word.toLowerCase() == xpathExtract.keywords[i]) return 1;
  }
  return 0;
};

xpathExtract.textKeywords = {
        category: [
                   'crumb',
                   'path',
                   'nav',                       
                   'path',
                   'header'                     
                   ],
        title   : [
                   'title',
                   'article'
                   ],           
        content : [
                   'content',                   
                   'artibody',
                   'article'
                   ],                 
        tag     : [
                   'tag'
                   ],
        pages   : [
                   'page',
                   ],
        date    : [
		   'source',
                   'info',
                   'time',
                   'date'
                   ],
        source  : [
		   'source',
                   'info'
                   ]
};

//for an element, generate its xpath from its parent, in different detail level
xpathExtract.getXpath = function(elem, type){
    var doc = (elem.ownerDocument == null) ? elem : elem.ownerDocument;
    var result = new Array();
    var tag = elem.tagName.toLowerCase();
    if(typeof(tag) != "undefined"){
	//alert(tag);
	this.keywords.push(tag);
    }
    for(var level = 0; level < 4; level ++){
        result_xpaths = xpathExtract.getXpathWithLevel(elem, level);
        for(var i in result_xpaths){
                item = new xpathItem();
                item.xpath = result_xpaths[i];
                (xpathExtract.defineAuthority(doc, xpathExtract.textKeywords[type], item));
                result.push(item);        
        }
    }
    result.sort(function(x, y){
        return y.authority - x.authority;
    })
    this.keywords.pop();
    return result;
};

//concat parent's xpath and child's xpath.
xpathExtract.concatXpaths = function(upXpathes, downXpathes, distance){
  var symbol = '/';
  if(distance > 0) {
    symbol = "//";
  }
  var result = new Array;
  if(upXpathes.length != 0 && downXpathes.length != 0){
    for(var i in downXpathes){
        for(var j in upXpathes){
            result.push(upXpathes[j] + symbol + downXpathes[i]);
        }
    }
  }
  return result;
};

//according on the detail level, get a node's xpath
xpathExtract.getXpathWithLevel = function(elem, level){
    var nodeXpaths = xpathExtract.getXpathForNode(elem);
    var distance = 0;
    while(elem && level > 0 &&(elem.nodeType != 9)){
        elem = elem.parentNode;
        var parentXpaths = xpathExtract.getXpathForNode(elem);
        if(parentXpaths.length > 0){
            level--;
            nodeXpaths = xpathExtract.concatXpaths(parentXpaths, nodeXpaths, distance);
            distance = 0;
        }else{
            distance = 1;
        }
    }
    nodeXpaths = xpathExtract.concatXpaths([""], nodeXpaths, 1);
    return nodeXpaths;
}

//for a single node, generate its xpath
xpathExtract.getXpathForNode = function(elem){
    var result = new Array;
    if((typeof(elem.tagName) != "undefined") && xpathExtract.isKeywords(elem.tagName)){
        var predictors = xpathExtract.getPredictors(elem);
        for(var i in predictors){
            result.push(elem.tagName.toLowerCase() + predictors[i]);
        }
        result.push(elem.tagName.toLowerCase());
    }
    return result;
};

xpathExtract.getElemPos = function(elem){
    var index = -1;
    var tagname = elem.tagName;
    var nodes = elem.parentNode.childNodes;
    if(tagname == null || nodes.length < 0) return index;
    for(var i = 0; i < nodes.length; i++){
	if(nodes[i] == elem) break;
    }
    if(i == nodes.length) return index;
    index ++;
    for(; i >=0; i--){
	if(nodes[i].tagName == tagname)
	    index ++;
    }
    return index;
};

//generate a single node's xpath predictor
xpathExtract.getPredictors = function(elem){
    var predictors = new Array;
    var position = this.getElemPos(elem);
    var p_id = false;
    var p_class =false;
    //alert(elem.tagName + " position is " + position);
    if(position != -1){
	predictors.push("[position() = " + position + " ]");
    }
    if(elem.getAttribute("id") != null && elem.getAttribute("id").length >0){
        predictors.push("[@id = '" + elem.getAttribute("id") + "']");
	p_id = true;
	if(position != -1){
	    predictors.push("[@id = '" + elem.getAttribute("id") + "' and position() = " + position + " ]");
	    //alert("added");
	}
    }
    if(elem.getAttribute("class") != null && elem.getAttribute("class").length >0){
        predictors.push("[@class = '" + elem.getAttribute("class") + "']");
	p_class = true;
	if(position != -1){
	    predictors.push("[@class = '" + elem.getAttribute("class") + "' and position() = " + position + " ]");
	}

    }
    if(p_id && p_class){
        predictors.push("[@id = '" + elem.getAttribute("id") + "' and @class = '" + elem.getAttribute("class") + "']");
	if(position != -1){
	    predictors.push("[@id = '" + elem.getAttribute("id") + "' and @class = '" + elem.getAttribute("class") + "' and position() = " + position + " ]");
	}

    }
    return predictors;
}

//deprecated function
xpathExtract.getXpathbackup = function(elem){
    /*
    var arr = [];
    var index = 0;
    function getTagIndex(obj){
        var begin = 0;
        var firstChild = obj.parentNode.firstChild;
        while(firstChild){
            if(firstChild == obj) return (begin + 1);
            if(firstChild.nodeType == 1 && firstChild.tagName == obj.tagName) begin++;
            firstChild = firstChild.nextSibling;
        }
        return "";
    }
    
    var attribute_detect = ['class','id'];
    function getAttribute(obj, attributes_detect){
        if(!obj.hasAttributes()) return "";
        var result_string;
        var attributes_origin = obj.attributes;
        for(var attribute in attributes_detect){
            if(attributes_origin[attribute]){
                result_string += " " + attributes_origin[attribute].name + "=" + '"' + attributes_origin[attribute].value +'"';
            }
        }
        return result_string;
    }
    while(elem){
        arr[index++] = elem.nodeName + "[" +  getTagIndex(elem) + "]";
        if(elem.tagName == "HTML") break;
        elem = elem.parentNode;
    }*/
    var doc = elem.ownerDocument;
    var links = [];
    links = autopagerXPath.discoveryMoreLinks(doc,links,[elem]);
    if (elem.parentNode && elem.parentNode.tagName.toLowerCase()=="a")
    {
        var alinks = autopagerXPath.discoveryMoreLinks(doc,[],[elem.parentNode]);
        if (alinks)
        {
            for(var i in alinks)
            {
                links.push(alinks[i]);
            }
        }
    }
    return links;
};

//apply a xpath on a doc and return the results
xpathExtract.evaluate = function(node,expr,enableJS,max){
    var doc = (node.ownerDocument == null) ? node : node.ownerDocument;
    var found = [];
    //var aExpr = this.preparePath(doc,expr,enableJS);
    var xpe = null;
    try{
        xpe = new XPathEvaluator();
    }catch(e)
    {
        xpe = doc
    }
    //autopagerBwUtil.consoleLog("evaluate aExpr:" + aExpr)
        
    var defaultNSResolver = xpe.createNSResolver(doc.documentElement);
    function nsResolver(prefix) {
        var ns = {
            'xhtml' : 'http://www.w3.org/1999/xhtml',
            'mathml': 'http://www.w3.org/1998/Math/MathML'
        };
        return ns[prefix] || defaultNSResolver(prefix);
    }
    try{
        var result = xpe.evaluate(expr, node, nsResolver, xpathExtract.XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        
        found = xpathExtract.dumpResult(result,max);
        //autopagerBwUtil.consoleLog("evaluate result:" + found)
    }catch(e) {
        //autopagerBwUtil.consoleLog("evaluate exception:" + e)
        //[not (@class='autoPagerS')]
        try{
            expr = expr.replace("[not (@class='autoPagerS')]",'');
            var result2 = xpe.evaluate(expr, node, nsResolver, AutoPagerNS.XPathResult.ANY_TYPE, null);
            found = this.dumpResult(result2,max);
        }catch(ex) {
            //autopagerUtils.log("unableevaluator");//TODO: autopagerUtils.autopagerFormatString("unableevaluator",[aExpr,e]));
        }
    }       
    return found;
};

xpathExtract.dumpResult = function(result,max){
    var found = [];
    var res;
    switch (result.resultType)
    {
        case xpathExtract.XPathResult.NUMBER_TYPE:
            found.push(String(result.numberValue));
            break;
        case xpathExtract.XPathResult.STRING_TYPE:
            found.push(result.stringValue);
            break;
        case xpathExtract.XPathResult.BOOLEAN_TYPE:
            found.push(String(result.booleanValue));
            break;
        default:
        {
            while ((res = result.iterateNext()) && (typeof(max)=='undefined' || found.length<max))
                found.push(res);
        }
    }
    return found;
};

xpathExtract.defineAuthority = function(doc, keywords, xpathItem){
        for(var i in keywords){
                if(xpathItem.xpath.toLowerCase().indexOf(keywords[i]) != -1){
                        xpathItem.authority += this.pathAuthority_rule.keyword_auth;
                        //window.alert("keyword " + keywords[i]);
                }
        }
        //window.alert('xpath ' + xpathItem.xpaht + " is " + xpathItem.authority);
        var reg = /\/\/|\//g;
        var count = 0;
        while(reg.exec(xpathItem.xpath)){
                count ++;
        }
        if(count == 0) count = 1;
        xpathItem.authority = xpathItem.authority/(1 + count * this.pathAuthority_rule.level_dividor_auth);
        //window.alert('xpath ' + xpathItem.xpaht + " is " + xpathItem.authority);
        var found = this.evaluate(doc, xpathItem.xpath,true).length;
        //alert("xpath: " + xpathItem.xpath + " find :" + found);
        if(xpathItem.xpath.lengh != 0){
                xpathItem.authority = xpathItem.authority / (xpathItem.xpath.length * this.pathAuthority_rule.length_auth + 1);
        }
        if(found > 1){
                xpathItem.authority = xpathItem.authority / (found);
                return false;
        }
        return true;
};

function xpathItem(){
        this.authority = xpathExtract.pathAuthority_rule.original_auth;
        this.xpath = null;
}
