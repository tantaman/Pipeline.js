# Pipeline.js

A way to create pipelines for method processing.

```javascript
// Pipeline get, put and delete methods.
var pipeline = createPipeline(['get', 'put', 'delete']);

// Add a logger
pipeline.addLast('logger', {
	get: function(ctx, uri, cb) {
		console.log('Getting: ' + uri);
		return ctx.next(uri, cb);
	},

	put: function(ctx, uri, resource) {
		console.log('Putting: ' + uri);
		return ctx.next(uri, resource);
	},

	delete: function(ctx, uri) {
		console.log('Deleting: ' + uri);
		return ctx.next(uri);
	}
});

// Add a cache handler
pipeline.addLast('cache', {
	get: function(ctx, uri, cb) {
		if (uri in cache) {
			// Call back with cached item
			cb(cache[uri]);
		} else {
			// Pass invocation to next guy in the pipe
			ctx.next(uri, function(resource) {
				// cache the result
				cache[uri] = resource;
				cb(resource);
			});
		}
	},

	put: function(ctx, uri, resource) {
		cache[uri] = resource;
		ctx.next(uri, resource);
	},

	delete: function(ctx, uri) {
		delete cache[uri];
		ctx.next(uri);
	}
});

// Add the actual resource retriever
pipeline.addLast('xhr', {
	get: function(ctx, uri, cb) {
		xhr.get(uri, cb);
	},

	put: function(ctx, uri, resource) {
		xhr.put(uri, resource);
	},

	delete: function(ctx, uri) {
		xhr.delete(uri);
	}
});

// Start using the pipeline
pipeline.get('http://example.com/resource', function(resource) {
	...
});

pipeline.put('http://example.com/resource2', resource);
pipeline.delete('http://example.com/resource3');
```