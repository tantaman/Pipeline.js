
/**
@author Matt Crinklaw-Vogt
*/
(function(root) {
function PipeContext(handlers, nextMehod, end) {
	this._handlers = handlers;
	this._next = nextMehod;
	this._end = end;

	this._i = 0;
}

PipeContext.prototype = {
	next: function() {
		var args = Array.prototype.slice.call(arguments, 0);
		args.unshift(this);
		return this._next.apply(this, args);
	},

	_nextHandler: function() {
		if (this._i >= this._handlers.length) return this._end;

		var handler = this._handlers[this._i].handler;
		this._i += 1;
		return handler;
	},

	length: function() {
		return this._handlers.length;
	}
};

function indexOfHandler(handlers, len, target) {
	for (var i = 0; i < len; ++i) {
		var handler = handlers[i];
		if (handler.name === target || handler.handler === target) {
			return i;
		}
	}

	return -1;
}

var abstractPipeline = {
	addFirst: function(name, handler) {
		this._handlers.unshift({name: name, handler: handler});
	},

	addLast: function(name, handler) {
		this._handlers.push({name: name, handler: handler});
	},

 	/**
 	Add the handler with the given name after the 
 	handler specified by target.  Target can be a handler
 	name or a handler instance.
 	*/
	addAfter: function(target, name, handler) {
		var handlers = this._handlers;
		var len = handlers.length;
		var i = indexOfHandler(handlers, len, target);

		if (i >= 0) {
			handlers.splice(i+1, 0, {name: name, handler: handler});
		}
	},

	/**
	Add the handler with the given name after the handler
	specified by target.  Target can be a handler name or
	a handler instance.
	*/
	addBefore: function(target, name, handler) {
		var handlers = this._handlers;
		var len = handlers.length;
		var i = indexOfHandler(handlers, len, target);

		if (i >= 0) {
			handlers.splice(i, 0, {name: name, handler: handler});
		}
	},

	/**
	Replace the handler specified by target.
	*/
	replace: function(target, newName, handler) {
		var handlers = this._handlers;
		var len = handlers.length;
		var i = indexOfHandler(handlers, len, target);

		if (i >= 0) {
			handlers.splice(i, 1, {name: newName, handler: handler});
		}
	},

	removeFirst: function() {
		return this._handlers.shift();
	},

	removeLast: function() {
		return this._handlers.pop();
	},

	remove: function(target) {
		var handlers = this._handlers;
		var len = handlers.length;
		var i = indexOfHandler(handlers, len, target);

		if (i >= 0)
			handlers.splice(i, 1);
	}
};

function createPipeline(pipedMethodNames) {
	var end = {};
	var endStubFunc = function() { return end; };
	var nextMethods = {};

	function Pipeline() {
		this._handlers = [];
		this._contextCtor = PipeContext;
		this._nextMethods = nextMethods;
		this.end = end;
	}

	var pipelineProto = Pipeline.prototype = Object.create(abstractPipeline);

	pipedMethodNames.forEach(function(name) {
		end[name] = endStubFunc;

		nextMethods[name] = new Function(
			"var handler = this._nextHandler();" +
			"return handler." + name + ".apply(handler, arguments);");

		pipelineProto[name] = new Function(
			"var ctx = new this._contextCtor(this._handlers, this._nextMethods." + name + ", this.end);"
			+ "return ctx.next.apply(ctx, arguments);");
	});

	return new Pipeline();
}

if (typeof define === 'function' && define.amd) {
	define(createPipeline);
} else if (typeof exports === "object") {
	module.exports = createPipeline;
} else {
	root.createPipeline = createPipeline;
}

})(this);