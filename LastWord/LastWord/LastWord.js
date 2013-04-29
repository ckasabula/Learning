function GetLastWord(text) {
    var match = text.match(/\S\w*$/);
    return match;
}

function ProcessRootResult(data, type) {
    var idRoot = "#" + type;
    var resultsId = idRoot + "_results";
    
    if (data)
    {
        var synDataId = idRoot + "_syn";
        var synResultsId = synDataId + "_results";
        var antDataId = idRoot + "_ant";
        var antResultsId = antDataId + "_results";
        var relDataId = idRoot + "_rel";
        var relResultsId = relDataId + "_results";
        var simDataId = idRoot + "_sim";
        var simResultsId = simDataId + "_results";

        ProcessResult(data.syn, synDataId, synResultsId);
        ProcessResult(data.ant, antDataId, antResultsId);
        ProcessResult(data.rel, relDataId, relResultsId);
        ProcessResult(data.sim, simDataId, simResultsId);

        $(resultsId).show();
    }
    else
    {
        $(resultsId).hide();
    }
}

function ProcessResult(data, dataId, resultsId) {
    if (data)
    {
        $(dataId).html("");
        $.each(data, function(i, item) {
            $("<li/>").text(item).appendTo(dataId);
        });
        $(resultsId).show();
    }
    else
    {
        $(resultsId).hide();
    }
}

function HideThesaurusResults()
{
    $("#noun_results").hide();
    $("#verb_results").hide();
    $("#adjective_results").hide();
}

$(document).ready(function() {
    HideThesaurusResults();

    if (this.cookie != "") {
        var apiKey = this.cookie.split("=")[1];
        $("#apikey").val(apiKey);
    }

    $("#clear").click(function() {
        $("#text1").val("");
    });

    $("#text1").keypress(function(evt) {
        var key = String.fromCharCode(evt.charCode);
        var whiteSpace = key.match(/\s/);
        if (whiteSpace) {
            var last = GetLastWord(this.value.substr(0, this.selectionEnd));
            if (last) {
                $("#last").val(last);

                var url = "http://words.bighugelabs.com/api/2/"
                        + $("#apikey").val()
                        + "/"
                        + last 
                        + "/json";

                $.ajax({
                    url: url,
                    type: "GET",
                    dataType : "jsonp",
                    crossDomain: true,
                    success: function(data) {
                        ProcessRootResult(data.noun, "noun");
                        ProcessRootResult(data.verb, "verb");
                        ProcessRootResult(data.adjective, "adjective");
                    },
                    error : function(xhr, status, errorThrown) {
                        console.log("Failed to lookup word: " + status);
                        HideThesaurusResults();
                    }
                });
            }
        }
    });
    
    $("#apikey").blur(function() {
        document.cookie = "apikey=" + $("#apikey").val();
    });
});
