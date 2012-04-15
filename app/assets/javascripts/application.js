// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require auto_resize
//= require jquery.tabby
//= require_tree .



$(function(){
  $('textarea').autosize()
  $('textarea').tabby({tabString: '  '})
  $('textarea').keydown(function (e) {
   if ((e.ctrlKey || e.metaKey) && e.keyCode == 13) {
     $(this).parents('form:first').submit()
   }
  });
  $('a[href=#]').click(function(){ return false })
    
  $('a.replaceable').live('ajax:success', function(e, data){
    $(this).replaceWith(data.new_link)
    if ($(this).hasClass('remembrance')){
      $.getJSON('/account/remembrance.json', function(data){
        $('section.remembrance').replaceWith(data.div)
      })
    }
  })
  
  $("li.subscription form").live('ajax:success', function(e, data){
    $(this).parent().replaceWith(data.new_form);
    link = $($('ul#subscriptions').find('a#' + data.link_id)[0]);
    if (link.length > 0) {
      link.parent().remove();
    } else {
      $('ul#subscriptions').append(data.tag_block);
    }
  })
  
  var preview_button = $("form.new_comment").find('input.preview_button');  
  var comment_form = $("form.new_comment");
  var fieldset = comment_form.find('fieldset');
  
  preview_button.click(function(e){
    
    //e.preventDefault();
    
    if(preview_button.attr('value') == 'Write') {
      comment_form.find('article.comment').replaceWith(fieldset);
      preview_button.attr('value', 'Preview');
    } else {
      //fieldset = comment_form.find('fieldset').clone();
      preview_button.attr('value', 'Write');
      //comment_form.submit();
    }
    
  })
  
  comment_form.live('ajax:success', function(e, data){
    if(preview_button.attr('value') == 'Write') {
      fieldset = comment_form.find('fieldset').clone();
      $(this).children('fieldset').replaceWith(data.comment);
    }
    console.log(fieldset);
  })
})
