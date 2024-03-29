var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground")
var Comment = require("../models/comment")
//===================
// COMMENTS ROUTES
//===================

// COMMENTS FORM
router.get('/new', isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if (err){
			console.log(err)
		} else {
			//console.log(campground)
			res.render('comments/new', {camp : campground})
		}
		
	});
});

//========================
// NEW COMMENTS POST ROUTE 
//========================

router.post("/", isLoggedIn, function(req, res){
	//find the camp by id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err)
		// show all campgrounds
			res.redirect('/campgrounds')
		// add the new comment to the camp
		} else {
//			console.log(req.body.comment)
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err)
				} else {
					// add username and user id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("succes", "Successfully added a comment")
					res.redirect('/campgrounds/' + campground._id);
				}
			});
		}
	});
});

// EDIT ROUTE

router.get('/:comment_id/edit', checkCommentOwnership, function(req, res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err) {
			res.redirect("back");			
		} else {
			res.render("comments/edit", {camp_id:req.params.id, comment: foundComment})	
		}
	});
});
// UPDATE ROUTE
router.put('/:comment_id', checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
			if(err) {
				res.redirect("back")
			} else {
				res.redirect("/campgrounds/" + req.params.id)
			}
	});
});

// COMMENT DELETE ROUTE

router.delete('/:comment_id', checkCommentOwnership, function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err, deletedCampground){
		if(err) {
			res.redirect("back")
		} else {
			res.redirect("/campgrounds/" + req.params.id)
		}
	});
});

function checkCommentOwnership(req,res,next){
		if (req.isAuthenticated()) {
			Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err) {
			res.redirect("back")
		} else {
			// check authorization
			if (foundComment.author.id.equals(req.user._id)) {
				next();
			} else {
				res.redirect("back")
			}
		}
	});	
		} else{
			res.redirect("back");
		} 
}

// LOGIN CHECK FUNCTION
function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
};

module.exports = router;