(function($) {
  
  var ewSlide = function(el, settings){
    
    var self = this;
    
    var viewport;
    var wrapper;
    var slides;
    var previous_button;
    var next_button;
    var current_slide = 0;
    
    var hovering = false;
  
    var calculateSize = function(){
      var width = el.parent().width();
      var items;
      var margin;
      var itemWidth = settings.itemWidth;
      
      if(settings.responsiveType == 'slide-width'){
        slides.css({
          'width': settings.minItemWidth,
        });
        var width = el.parent().width();
        
        if(settings.minItems == settings.maxItems){
          items = settings.minItems;
        }
        
        var maxItemWidth = Math.min(settings.maxItemWidth, width);
        var minItemWidth = Math.max(settings.minItemWidth, width);
        itemWidth = Math.floor((maxItemWidth + minItemWidth) / 2);
        
        if(minItemWidth > maxItemWidth){
          itemWidth = maxItemWidth;
        }
        else{
          itemWidth = minItemWidth;
        }
        
        slides.css({
          'width': itemWidth,
        });
        var width = el.parent().width();
      }
      
      if(settings.responsiveType == 'margin' || settings.responsiveType == 'slide-width'){
        items = Math.floor(width / itemWidth);
        items = Math.min(items, slides.length);
        if(items == 1){
          slides.css({
            'margin-left': 0,
            'margin-right': 0
          });
          width = el.parent().width();
        }
        var totalMargin = width - (items * itemWidth);
        margin = totalMargin / (items * 2);
        slides.css({
          'margin-left': margin,
          'margin-right': margin
        });
      }
      
      return {
        'width': width,
        'items': items,
        'margin': margin
      };
    };
  
    this.next = function(){
      var state = calculateSize();
      this.goToSlide(current_slide + state.items);
    };
  
    this.previous = function(){
      var state = calculateSize();
      this.goToSlide(current_slide - state.items);
    };
    
    this.goToSlide = function(slide_number, no_animate){
      var state = calculateSize();
      
      if(slide_number < 0){
        if(current_slide == 0 && settings.infiniteScroll){
          slide_number = slides.length - 1;
        }
        else{
          slide_number = 0;
        }
      }
      
      if(settings.infiniteScroll){
    	  slide_number = slide_number % slides.length;
      }

      var new_current_slide = slide_number;
      if(slide_number >= (slides.length - state.items)){
        new_current_slide = slides.length - state.items;
        wrapper.addClass('ew-slide-end');
      }
      else if(slides.length == state.items){
        new_current_slide = 0;
        wrapper.addClass('ew-slide-end');
      }
      else{
        wrapper.removeClass('ew-slide-end');
      }
      
      // Add class if the slideshow is at the beginning.
      if(new_current_slide == 0){
        wrapper.addClass('ew-slide-start');
      }
      else{
        wrapper.removeClass('ew-slide-start');
      }

      var css = {'left': -((slides.width() + (state.margin * 2)) * new_current_slide)};
      if(no_animate || $.support.transition){
        el.css(css);
        current_slide = new_current_slide;
      }
      else{
        el.animate(
          css,
          400,
          'swing',
          function(){
            current_slide = new_current_slide;
          }
        );
      }
    };
    
    el.wrap($('<div class="ew-slide-wrapper"><div class="ew-slide-viewport"></div></div>'));
    
    el.each(function(){
      var $this = $(this);
      viewport = $this.parent();
      wrapper = viewport.parent();
      
      slides = $('>li', $this);
      //if(settings.itemWidth == 'auto'){
      //  settings.itemWidth = slides.width();
      //}
      //slides.css({
      //  'width': settings.minItemWidth
      //});
      
      if(settings.controlButtons){
        previous_button = $('<div class="ew-slide-previous">Previous</div>');
        wrapper.prepend(previous_button);
        next_button = $('<div class="ew-slide-next">Next</div>');
        wrapper.append(next_button);
        
        previous_button.click(function(){
          self.previous();
        });
        next_button.click(function(){
          self.next();
        });
      }

      var first_x = 0;
      //var first_y = 0;
      var last_x = 0;
      //var last_y = 0;
      $this.bind('touchstart touchmove touchend touchcancel', {}, function(e){
        e.preventDefault();
        if(e.type == 'touchstart'){
          first_x = e.originalEvent.touches[0].clientX;
        }
        else if(e.type == 'touchmove'){
          last_x = e.originalEvent.touches[0].clientX;
        }
        else if(e.type == 'touchend' || e.type == 'touchcancel'){
          var diff = first_x - last_x;
          if(diff > settings.touchSensitivity){
            self.next();
          }
          else if(diff < -settings.touchSensitivity){
            self.previous();
          }
        }
      });
      
      $(window).bind('resize.ewslide', function(){
        self.goToSlide(current_slide, true);
      });
      
      //calculateSize($this, settings);
      self.goToSlide(0);
      
      if(settings.autoScroll > 0){
        window.setInterval(function(){
          if(!hovering){
            self.next();
          }
        }, settings.autoScroll);
        
        wrapper.hover(function(){
          hovering = true;
        },
        function(){
          hovering = false;
        });
      }
    });
  };

  $.fn.ewSlide = function(settings) {
    var defaultSettings = {
      itemWidth: 'auto',
      maxItemWidth: 0,
      minItemWidth: 0,
      itemMargin: 'auto',
      minItems: 1,
      maxItems: -1,
      responsiveType: 'margin', // margin|slide-width
      touchSensitivity: 30,
      infiniteScroll: true,
      autoScroll: 0,
      controlButtons: true,
    };

    settings = $.extend({}, defaultSettings, settings);

    this.each(function(){
      var $this = $(this);
      var instance = new ewSlide($this, settings);
      $this.data('ewslide', instance);
    });

    return this;
  };

  // jQuery.support.transition
  // to verify that CSS3 transition is supported (or any of its browser-specific implementations)
  // From: https://gist.github.com/jonraasch/373874
  $.support.transition = (function(){
    var thisBody = document.body || document.documentElement,
    thisStyle = thisBody.style,
    support = thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined;
    return support;
  })();
})(jQuery);
