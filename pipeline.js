
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

		var handler = this._handlers[this._i];
		this._i += 1;
		return handler;
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

	var pipelineProto = Pipeline.prototype = {
		addHandler: function(handler) {
			this._handlers.push(handler);
		}
	};

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