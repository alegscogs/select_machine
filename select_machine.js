function select_machine(select_scope, state_machine, options) {

  var
    $select_scope = $(select_scope),
    ids_selector = _.map(_.keys(state_machine), function (key) { return '#' + key; }).join(', ');

  $select_scope.delegate(ids_selector, 'change', function () {
    $(this).trigger('state_change');
  });

  $select_scope.delegate(ids_selector, 'state_change', function () {
    var
      $this = $(this),
      new_value = $this.val();

    _.each(state_machine[$this[0].id], function (rule_sets, target_key) {
      var
        $target = $('#' + target_key),
        $target_all = $target.add($target.prev('label')),
        target_prev_value = $target.val(),
        rule = _.result(rule_sets, new_value),
        $new_options;

      if (typeof $target.data('options') === 'undefined') {
        $target.data('options', $target.find('option'));
      }

      if (_.isRegExp(rule)) {
        // then convert it to an array of matching states
        rule = $target.option_values(function (value) {
          return value.match(rule);
        });
      }

      if (_.isArray(rule)) {
        // then convert it to a selector string
        rule = _.map(rule, function (allowed_state) {
          return '[value="' + allowed_state + '"]';
        }).join(', ');
      }

      if (rule) {
        $new_options = $($target.data('options'));

        if (_.isString(rule)) {
          // apply it as a selector to filter the options set
          $new_options = $new_options.filter(rule);
        }

        if (options.include_blank) {
          $new_options = $('<option>').add($new_options);
        }

        $target.html($new_options);
        $target_all.show();

        if ($target.val() !== target_prev_value) {
          $target.trigger('change');
        }
      } else {
        options.default_control($target_all);

        $target.trigger('change');
      }

    });
  });
}

$.fn.option_values = function (filter) {
  var values = $(this).first().find('option').map(function (i, option) {
    var value = option.value;

    if (typeof filter === 'function' && !filter(value)) {
      return false;
    }

    return value;
  });
  return _(values).without(false);
};

$.fn.select_machine = function (state_machine, options) {
  var default_options = {

    // This option defines the callback to execute if a target is 'controlled'
    // by a select_machine but no rules are defined for a selected state.
    default_control : function ($target_markup) {
      $target_markup.hide();
    }

  };

  $(this).each(function () {
    select_machine(this, state_machine, $.extend(default_options, options));
  });

  return this;
};

