
var QueryBlackList = {
	// "Jobs": [{ key: 'deleted', operation: "!=" , value: true }]
};

var ParseUtils = {
    queryObject: function(_class, skip, limit, ignore_black_list) {
        var o       = Parse.Object.extend(_class),
            query   = new Parse.Query(o);

        query.skip(skip || 0);
		query.limit(limit || 1000);

		// force to ignore black list query
		if (!ignore_black_list) {
			addBlackListQuery(_class, query);
		}

        return query;
    },
    initObject: function(_class) {
        var o = Parse.Object.extend(_class);
        return new o();
    }
};

function addBlackListQuery(_class, query) {
	var list = QueryBlackList[_class];

	if (!list) { return; }

	for (var i = 0, ii = list.length; i < ii; i++) {
		var q = list[i];

		if (q.operation == '=') {
			query.equalTo(q.key, q.value);
		} else if (q.operation == '!=') {
			query.notEqualTo(q.key, q.value);
		}
	}
}

Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('transferProperty', function(req, res) {
	var params 		= req.params,
		userId 		= params.uId,
		productId   = params.pId;

	if (!userId || !productId) {
		return res.error('userId OR productId not found');
	}
	
	var property = ParseUtils.initObject('Properties');
		property.id = productId;

	property.fetch().then(function(p) {
		if (!p) {
			return res.success({ success: false, error: 'Property not found' });
		}
		
		var user = ParseUtils.initObject('_User');
			user.id = userId;
			
		var t = ParseUtils.initObject('Transactions');
			user.id = userId;
		
		var history = p.get('history') || [];
		
		t.set('original', p.get(owner));
		t.set('next', p.get(user));
		t.set('confirmedAt', new Date());
		t.set('productId', p.id);
		
		t.save().then(function(r) {
			p.set('owner', user);
			p.set('history', history.push(r.id));
			res.success({ success: true, property: p });
		}, function(err) {
			res.success({ success: false, message: err.message || JSON.stringify(err) });
		});
	}, function(e) {
		res.error({ success: false, message: e.message || JSON.stringify(e) });
	});
});
