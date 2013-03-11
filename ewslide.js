(function($) {
  
  var ewSlide = function(el, settings){ console.log('Starting...');
    
    var self = this;
    
    var viewport;
    var wrapper;
    var slides;
    var previous_button;
    var next_button;
    var current_slide = 0;
  
    var calculateSize = function(){
      var width = el.parent().width();
      var items = Math.floor(width / settings.itemWidth);
      if(items == 1){
        slides.css({
          'margin-left': 0,
          'margin-right': 0
        });
        var width = el.parent().width();
      }
      var margin;
      if(settings.responsiveType == 'margin'){
        var totalMargin = width - (items * settings.itemWidth);
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
      //console.log('next');
      var state = calculateSize();
      this.goToSlide(current_slide + state.items);
    };
  
    this.previous = function(){
      //console.log('previous');
      var state = calculateSize();
      this.goToSlide(current_slide - state.items);
    };
    
    this.goToSlide = function(slide_number, no_animate){
      var state = calculateSize();
      
      if(slide_number < 0){
        if(current_slide == 0){
          slide_number = slides.length - 1;
        }
        else{
          slide_number = 0;
        }
      }
      slide_number = slide_number % slides.length;

      var new_current_slide = slide_number;
      if(slide_number > (slides.length - state.items)){
        new_current_slide = slides.length - state.items;
        el.addClass('ew-slide-end');
      }
      else{
        el.removeClass('ew-slide-end');
      }
      
      // Add class if the slideshow is at the beginning.
      if(slide_number == 0){
        el.addClass('ew-slide-start');
      }
      else{
        el.removeClass('ew-slide-start');
      }

      var css = {'left': -((settings.itemWidth + (state.margin * 2)) * new_current_slide)};
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
      if(settings.itemWidth == 'auto'){
        settings.itemWidth = slides.width();
      }
      slides.css({
        'width': settings.itemWidth
      });
      
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

      var first_x = 0;
      //var first_y = 0;
      var last_x = 0;
      //var last_y = 0;
      $this.bind('touchstart touchmove touchend', {}, function(e){
        e.preventDefault();
        //console.log(e.type);
        if(e.type == 'touchstart'){
          first_x = e.originalEvent.touches[0].clientX;
          //first_y = e.originalEvent.touches[0].clientY;
        }
        else if(e.type == 'touchmove'){
          last_x = e.originalEvent.touches[0].clientX;
          //last_y = e.originalEvent.touches[0].clientY;
        }
        else if(e.type == 'touchend'){
          var diff = first_x - last_x;
          //console.log(diff);
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
      
      calculateSize($this, settings);
    });
  };
  
  $.fn.ewSlide = function(settings) {
    settings = $.extend(settings, {
      itemWidth: 'auto',
      itemMargin: 'auto',
      minItems: 1,
      responsiveType: 'margin',
      touchSensitivity: 30
    });
    
    var instance = new ewSlide(this, settings);
    
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