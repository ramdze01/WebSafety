var builder = WebApplication.CreateBuilder(args);

// Allow the React frontend to call this API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Use the CORS policy
app.UseCors("AllowReactApp");

// Front page of the API.
// This just confirms that the backend is running.
app.MapGet("/", () => "Websafety is Running :)");

// This endpoint scans a website URL.
// Example: /api/scan?url=https://vg.no
app.MapGet("/api/scan", async (string? url) =>
{
    // Check if the URL is missing or empty
    if (string.IsNullOrWhiteSpace(url))
    {
        return Results.BadRequest("URL is required.");
    }

    // Check if the text is a valid full URL
    // Example of a valid URL: https://vg.no
    bool isValidUrl = Uri.TryCreate(url, UriKind.Absolute, out Uri? uri);

    if (!isValidUrl || uri == null)
    {
        return Results.BadRequest("Invalid URL.");
    }

    // Only allow http and https URLs
    if (uri.Scheme != "http" && uri.Scheme != "https")
    {
        return Results.BadRequest("Only HTTP and HTTPS URLs are allowed.");
    }

    // Check if the website uses HTTPS
    bool usesHttps = uri.Scheme == "https";

    // Create an HttpClient so we can send a request to the website
    using var httpClient = new HttpClient();

    // Do not wait forever if the website does not respond
    httpClient.Timeout = TimeSpan.FromSeconds(5);

    HttpResponseMessage response;

    try
    {
        // Send a request to the website and wait for the response
        response = await httpClient.GetAsync(uri);
    }
    catch
    {
        // If the website cannot be reached, return an error
        return Results.BadRequest("Could not reach the website.");
    }

    // Get the HTTP status code, for example 200, 301 or 404
    int statusCode = (int)response.StatusCode;

    // Check if the website has the HSTS security header
    bool hasHsts = response.Headers.Contains("Strict-Transport-Security");

    // Check if the website has Content-Security-Policy
    bool hasCsp = response.Headers.Contains("Content-Security-Policy");

    // Check if the website has X-Frame-Options
    bool hasXFrameOptions = response.Headers.Contains("X-Frame-Options");

    // Check if the website has X-Content-Type-Options
    bool hasXContentTypeOptions = response.Headers.Contains("X-Content-Type-Options");

    // Start score at 0
    int score = 0;

    if (usesHttps)
    {
        score = score + 30;
    }

    if (hasHsts)
    {
        score = score + 20;
    }

    if (hasCsp)
    {
        score = score + 20;
    }

    if (hasXFrameOptions)
    {
        score = score + 15;
    }

    if (hasXContentTypeOptions)
    {
        score = score + 15;
    }

    // Create a simple grade based on the score
    string grade;

    if (score >= 80)
    {
        grade = "A";
    }
    else if (score >= 60)
    {
        grade = "B";
    }
    else if (score >= 40)
    {
        grade = "C";
    }
    else
    {
        grade = "D";
    }

    // Create the result object that will be returned as JSON
    var result = new
    {
        Url = url,
        UsesHttps = usesHttps,
        StatusCode = statusCode,
        HasHsts = hasHsts,
        HasCsp = hasCsp,
        HasXFrameOptions = hasXFrameOptions,
        HasXContentTypeOptions = hasXContentTypeOptions,
        Score = score,
        Grade = grade
    };

    return Results.Ok(result);
});

app.Run();